package controllers

import (
	"bytes"
	"context"
	"fmt"
	"io"
	"path/filepath"
	"time"

	"backend-web/configs"
	"backend-web/models"

	"github.com/gofiber/fiber/v2"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

// GetUser get a user
func GetUser(c *fiber.Ctx) error {
	userClaims, ok := c.Locals("user").(*models.Claims)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"status":  "error",
			"message": "Unauthorized - invalid token",
		})
	}

	objID, err := primitive.ObjectIDFromHex(userClaims.UserID)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"status":  "error",
			"message": "Invalid user ID",
		})
	}

	collection := configs.GetCollection(configs.DB, "users")
	var user models.User
	err = collection.FindOne(context.TODO(), bson.M{"_id": objID}).Decode(&user)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"status":  "error",
			"message": "No user found",
		})
	}

	avatarURL := ""
	if !user.Avatar.IsZero() {
		avatarURL = fmt.Sprintf("http://localhost:8081/api/user/avatar/%s", user.Avatar.Hex())
	}

	return c.JSON(fiber.Map{
		"status":  "success",
		"message": "User found",
		"data": bson.M{
			"user_id":       user.Id.Hex(),
			"username":      user.Username,
			"email":         user.Email,
			"avatar":        avatarURL,
			"createdAt":     user.CreatedAt,
			"emailVerified": user.EmailVerified,
		},
	})
}

// UpdateUser update user
func UpdateUser(c *fiber.Ctx) error {
	userClaims, ok := c.Locals("user").(*models.Claims)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"status":  "error",
			"message": "Unauthorized - invalid token",
		})
	}

	objID, err := primitive.ObjectIDFromHex(userClaims.UserID)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"status":  "error",
			"message": "Invalid user ID",
		})
	}

	var updateData struct {
		Username string `json:"username"`
	}
	if err := c.BodyParser(&updateData); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"status":  "error",
			"message": "Invalid input",
		})
	}

	if updateData.Username == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"status":  "error",
			"message": "Username is required",
		})
	}

	collection := configs.GetCollection(configs.DB, "users")
	var existingUser models.User
	err = collection.FindOne(c.Context(), bson.M{
		"username": updateData.Username,
		"_id":      bson.M{"$ne": objID},
	}).Decode(&existingUser)
	if err == nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"status":  "error",
			"message": "Username already taken",
		})
	}

	updateFields := bson.M{
		"username": updateData.Username,
	}
	_, err = collection.UpdateOne(c.Context(), bson.M{"_id": objID}, bson.M{"$set": updateFields})
	if err != nil {
		fmt.Println("Update error:", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"status":  "error",
			"message": "Failed to update user",
		})
	}

	var updatedUser models.User
	err = collection.FindOne(c.Context(), bson.M{"_id": objID}).Decode(&updatedUser)
	if err != nil {
		fmt.Println("Fetch updated user error:", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"status":  "error",
			"message": "Failed to fetch updated user",
		})
	}

	avatarURL := ""
	if !updatedUser.Avatar.IsZero() {
		avatarURL = fmt.Sprintf("http://localhost:8081/api/user/avatar/%s", updatedUser.Avatar.Hex())
	}

	response := fiber.Map{
		"status":  "success",
		"message": "Username updated",
		"data": bson.M{
			"user_id":       updatedUser.Id.Hex(),
			"username":      updatedUser.Username,
			"email":         updatedUser.Email,
			"avatar":        avatarURL,
			"createdAt":     updatedUser.CreatedAt,
			"emailVerified": updatedUser.EmailVerified,
		},
	}
	fmt.Println("UpdateUser response:", response)
	return c.JSON(response)
}

// UploadAvatar uploads a user's profile picture to GridFS
func UploadAvatar(c *fiber.Ctx) error {
	userClaims, ok := c.Locals("user").(*models.Claims)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"status":  "error",
			"message": "Unauthorized - invalid token",
		})
	}

	objID, err := primitive.ObjectIDFromHex(userClaims.UserID)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"status":  "error",
			"message": "Invalid user ID",
		})
	}

	file, err := c.FormFile("avatar")
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"status":  "error",
			"message": "Failed to upload file",
		})
	}

	ext := filepath.Ext(file.Filename)
	if ext != ".jpg" && ext != ".jpeg" && ext != ".png" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"status":  "error",
			"message": "Only JPG, JPEG, or PNG files are allowed",
		})
	}

	if file.Size > 5*1024*1024 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"status":  "error",
			"message": "File size exceeds 5MB limit",
		})
	}

	fileContent, err := file.Open()
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"status":  "error",
			"message": "Failed to read file",
		})
	}
	defer fileContent.Close()

	bucket := configs.GetGridFSBucket(configs.DB)
	filename := userClaims.UserID + "_" + time.Now().Format("20060102150405") + ext

	uploadStream, err := bucket.OpenUploadStream(filename)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"status":  "error",
			"message": "Failed to create upload stream",
		})
	}
	defer uploadStream.Close()

	_, err = io.Copy(uploadStream, fileContent)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"status":  "error",
			"message": "Failed to upload file to GridFS",
		})
	}

	fileID := uploadStream.FileID.(primitive.ObjectID)

	fsFiles := configs.GetCollection(configs.DB, "fs.files")
	_, err = fsFiles.UpdateOne(
		context.TODO(),
		bson.M{"_id": fileID},
		bson.M{
			"$set": bson.M{
				"metadata": bson.M{
					"user_id": objID,
					"type":    "avatar",
				},
			},
		},
	)
	if err != nil {
		bucket.Delete(fileID)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"status":  "error",
			"message": "Failed to set metadata",
		})
	}

	collection := configs.GetCollection(configs.DB, "users")

	var user models.User
	err = collection.FindOne(context.TODO(), bson.M{"_id": objID}).Decode(&user)
	if err == nil && !user.Avatar.IsZero() {
		bucket.Delete(user.Avatar)
	}

	_, err = collection.UpdateOne(
		context.TODO(),
		bson.M{"_id": objID},
		bson.M{"$set": bson.M{"avatar": fileID}},
	)
	if err != nil {
		bucket.Delete(fileID)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"status":  "error",
			"message": "Failed to update avatar",
		})
	}

	avatarURL := fmt.Sprintf("http://localhost:8081/api/user/avatar/%s", fileID.Hex())
	return c.JSON(fiber.Map{
		"status":  "success",
		"message": "Avatar uploaded successfully",
		"data": bson.M{
			"avatar": avatarURL,
		},
	})
}

// GetAvatar retrieves a user's profile picture from GridFS
func GetAvatar(c *fiber.Ctx) error {
	fileIDStr := c.Params("fileId")
	fileID, err := primitive.ObjectIDFromHex(fileIDStr)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"status":  "error",
			"message": "Invalid file ID",
		})
	}

	fsFiles := configs.GetCollection(configs.DB, "fs.files")
	var fileDoc bson.M
	err = fsFiles.FindOne(context.TODO(), bson.M{"_id": fileID}).Decode(&fileDoc)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"status":  "error",
			"message": "Avatar not found",
		})
	}

	filename, _ := fileDoc["filename"].(string)
	metadata, _ := fileDoc["metadata"].(bson.M)

	bucket := configs.GetGridFSBucket(configs.DB)
	downloadStream, err := bucket.OpenDownloadStream(fileID)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"status":  "error",
			"message": "Avatar not found",
		})
	}
	defer downloadStream.Close()

	var buf bytes.Buffer
	_, err = buf.ReadFrom(downloadStream)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"status":  "error",
			"message": "Failed to read avatar",
		})
	}

	contentType := "image/jpeg"
	if metadata != nil {
		if t, ok := metadata["type"]; ok && t == "avatar" {
			ext := filepath.Ext(filename)
			if ext == ".png" {
				contentType = "image/png"
			}
		}
	}

	c.Set("Content-Type", contentType)
	return c.Send(buf.Bytes())
}
