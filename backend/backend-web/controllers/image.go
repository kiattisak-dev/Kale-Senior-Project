package controllers

import (
	"bytes"
	"path/filepath"

	"backend-web/configs"

	"github.com/gofiber/fiber/v2"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

// GetImage retrieves an image from GridFS
func GetImage(c *fiber.Ctx) error {
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
	err = fsFiles.FindOne(c.Context(), bson.M{"_id": fileID}).Decode(&fileDoc)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"status":  "error",
			"message": "Image not found",
		})
	}

	filename, _ := fileDoc["filename"].(string)
	metadata, _ := fileDoc["metadata"].(bson.M)

	bucket := configs.GetGridFSBucket(configs.DB)
	downloadStream, err := bucket.OpenDownloadStream(fileID)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"status":  "error",
			"message": "Image not found",
		})
	}
	defer downloadStream.Close()

	var buf bytes.Buffer
	_, err = buf.ReadFrom(downloadStream)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"status":  "error",
			"message": "Failed to read image",
		})
	}

	contentType := "image/jpeg"
	if metadata != nil {
		if t, ok := metadata["type"]; ok && t == "prediction_image" {
			ext := filepath.Ext(filename)
			if ext == ".png" {
				contentType = "image/png"
			}
		}
	}

	c.Set("Content-Type", contentType)
	return c.Send(buf.Bytes())
}