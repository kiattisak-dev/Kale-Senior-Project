package controllers

import (
	"backend-web/configs"
	"backend-web/models"
	"bytes"
	"context"
	"encoding/json"
	"io"
	"log"
	"mime/multipart"
	"net/http"
	"path/filepath"
	"strconv"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

func PredictHandler(c *fiber.Ctx) error {
	log.Println("Starting PredictHandler")

	// Get and parse JWT token
	tokenString := c.Get("Authorization")
	var userID string
	if tokenString != "" && len(tokenString) > 7 && tokenString[:7] == "Bearer " {
		token, err := jwt.Parse(tokenString[7:], func(token *jwt.Token) (interface{}, error) {
			return []byte(configs.EnvSecret()), nil
		})
		if err != nil {
			log.Printf("JWT Parse Error: %v", err)
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error": "Invalid token: " + err.Error(),
			})
		}
		if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
			if sub, exists := claims["sub"]; exists {
				userID, _ = sub.(string)
			} else if id, exists := claims["user_id"]; exists {
				userID, _ = id.(string)
			} else if id, exists := claims["id"]; exists {
				userID, _ = id.(string)
			}
			log.Printf("Extracted userID: %s", userID)
		} else {
			log.Println("Invalid claims or token")
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error": "Invalid token claims",
			})
		}
	} else {
		log.Println("No valid Bearer token found, proceeding without userID")
	}

	// Get uploaded file
	file, err := c.FormFile("file")
	if err != nil {
		log.Printf("Error getting form file: %v", err)
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"status":  "error",
			"message": "No file uploaded: " + err.Error(),
		})
	}
	log.Printf("Received file: %s", file.Filename)

	// Validate file type
	allowedExtensions := map[string]bool{".jpg": true, ".jpeg": true, ".png": true}
	ext := filepath.Ext(file.Filename)
	if !allowedExtensions[ext] {
		log.Printf("Invalid file type: %s", ext)
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"status":  "error",
			"message": "Only .jpg, .jpeg, .png files are allowed",
		})
	}

	// Validate file size (max 5MB)
	if file.Size > 5*1024*1024 {
		log.Printf("File size too large: %d bytes", file.Size)
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"status":  "error",
			"message": "File size exceeds 5MB limit",
		})
	}

	// Open file content
	fileContent, err := file.Open()
	if err != nil {
		log.Printf("Error opening file: %v", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"status":  "error",
			"message": "Failed to open file: " + err.Error(),
		})
	}
	defer fileContent.Close()

	// Save file to GridFS
	bucket := configs.GetGridFSBucket(configs.DB)
	uniqueFilename := strconv.FormatInt(time.Now().UnixNano()/1000/1000/1000, 10) + ext
	uploadOpts := options.GridFSUpload().SetMetadata(bson.M{
		"user_id": userID,
		"type":    "prediction_image",
	})
	uploadStream, err := bucket.OpenUploadStream(uniqueFilename, uploadOpts)
	if err != nil {
		log.Printf("Error creating upload stream for GridFS: %v", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"status":  "error",
			"message": "Failed to create upload stream: " + err.Error(),
		})
	}

	// Copy file content to upload stream
	written, err := io.Copy(uploadStream, fileContent)
	if err != nil {
		log.Printf("Error uploading file to GridFS: %v", err)
		uploadStream.Close()
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"status":  "error",
			"message": "Failed to upload file to GridFS: " + err.Error(),
		})
	}
	log.Printf("Uploaded %d bytes to GridFS", written)

	// Close upload stream
	if err := uploadStream.Close(); err != nil {
		log.Printf("Error closing upload stream: %v", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"status":  "error",
			"message": "Failed to commit file to GridFS: " + err.Error(),
		})
	}

	fileID := uploadStream.FileID.(primitive.ObjectID)
	log.Printf("File uploaded to GridFS with ID: %s", fileID.Hex())

	// Verify file exists in GridFS
	fsFiles := configs.GetCollection(configs.DB, "fs.files")
	var fileDoc bson.M
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	err = fsFiles.FindOne(ctx, bson.M{"_id": fileID}).Decode(&fileDoc)
	if err != nil {
		log.Printf("File not found in GridFS after upload: %v", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"status":  "error",
			"message": "Failed to verify file in GridFS: " + err.Error(),
		})
	}
	log.Printf("Verified file in GridFS: %v", fileDoc)

	// Create image URL
	imageUrl := "http://localhost:8081/api/image/" + fileID.Hex()

	// Create multipart form for prediction server
	body := &bytes.Buffer{}
	writer := multipart.NewWriter(body)
	part, err := writer.CreateFormFile("file", file.Filename)
	if err != nil {
		log.Printf("Error creating form file: %v", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"status":  "error",
			"message": "Failed to create form file: " + err.Error(),
		})
	}

	downloadStream, err := bucket.OpenDownloadStream(fileID)
	if err != nil {
		log.Printf("Error opening download stream from GridFS: %v", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"status":  "error",
			"message": "Failed to read file from GridFS: " + err.Error(),
		})
	}
	defer downloadStream.Close()

	_, err = io.Copy(part, downloadStream)
	if err != nil {
		log.Printf("Error copying file content: %v", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"status":  "error",
			"message": "Failed to copy file: " + err.Error(),
		})
	}
	writer.Close()

	// Send request to prediction server
	req, err := http.NewRequest("POST", "http://localhost:8083/predict", body)
	if err != nil {
		log.Printf("Error creating prediction request: %v", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"status":  "error",
			"message": "Failed to create request: " + err.Error(),
		})
	}
	req.Header.Set("Content-Type", writer.FormDataContentType())

	client := &http.Client{Timeout: 30 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		log.Printf("Error connecting to prediction server: %v", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"status":  "error",
			"message": "Failed to connect to prediction server: " + err.Error(),
		})
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		bodyBytes, _ := io.ReadAll(resp.Body)
		log.Printf("Prediction server returned non-200 status: %d, body: %s", resp.StatusCode, string(bodyBytes))
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"status":  "error",
			"message": "Prediction server error: " + resp.Status + " - " + string(bodyBytes),
		})
	}

	result, err := io.ReadAll(resp.Body)
	if err != nil {
		log.Printf("Error reading prediction response: %v", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"status":  "error",
			"message": "Failed to read response: " + err.Error(),
		})
	}
	log.Printf("Prediction response: %s", string(result))

	var resultData struct {
		Status string `json:"status"`
		Data   struct {
			PercentageWeightLose float64                `json:"percentage_weight_lose"`
			Features             map[string]interface{} `json:"features"`
		} `json:"data"`
	}
	if err := json.Unmarshal(result, &resultData); err != nil {
		log.Printf("Error parsing prediction response: %v", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"status":  "error",
			"message": "Failed to parse response: " + err.Error(),
		})
	}
	log.Println("Successfully parsed prediction response")

	// Save to MongoDB only if userID exists
	if userID != "" {
		collection := configs.GetCollection(configs.DB, "prediction_history")
		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		history := models.PredictionHistory{
			UserID:     userID,
			FileName:   file.Filename,
			Percentage: resultData.Data.PercentageWeightLose,
			ImageUrl:   imageUrl,
			Features:   resultData.Data.Features,
			Timestamp:  time.Now(),
		}

		// Insert with retry mechanism
		var result *mongo.InsertOneResult
		for attempt := 1; attempt <= 3; attempt++ {
			result, err = collection.InsertOne(ctx, history)
			if err == nil {
				break
			}
			log.Printf("Insert attempt %d failed: %v", attempt, err)
			time.Sleep(time.Millisecond * 100 * time.Duration(attempt))
			if attempt == 3 {
				return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
					"status":  "error",
					"message": "Failed to save history: " + err.Error(),
				})
			}
		}
		log.Printf("Inserted history with ID: %v", result.InsertedID)
	} else {
		log.Println("No userID, skipping history save")
	}

	return c.JSON(fiber.Map{
		"status": "success",
		"data": fiber.Map{
			"percentage_weight_lose": resultData.Data.PercentageWeightLose,
			"features":               resultData.Data.Features,
			"imageUrl":               imageUrl,
		},
	})
}
