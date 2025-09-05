// controllers/history.go
package controllers

import (
	"backend-web/configs"
	"backend-web/models"
	"context"
	"log"
	"time"

	"github.com/gofiber/fiber/v2"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

// GetPredictionHistory retrieves the prediction history for the authenticated user
func GetPredictionHistory(c *fiber.Ctx) error {

	userClaims, ok := c.Locals("user").(*models.Claims)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"status":  "error",
			"message": "Unauthorized - invalid token",
		})
	}

	collection := configs.GetCollection(configs.DB, "prediction_history")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	filter := bson.M{"user_id": userClaims.UserID}

	opts := options.Find().SetSort(bson.D{{"timestamp", -1}})

	cursor, err := collection.Find(ctx, filter, opts)
	if err != nil {
		log.Printf("Error: Failed to query prediction history - %v", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"status":  "error",
			"message": "Failed to retrieve prediction history",
		})
	}
	defer cursor.Close(ctx)

	var histories []models.PredictionHistory
	if err := cursor.All(ctx, &histories); err != nil {
		log.Printf("Error: Failed to decode prediction history - %v", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"status":  "error",
			"message": "Failed to decode prediction history",
		})
	}

	if len(histories) == 0 {
		log.Printf("No prediction history found for user %s", userClaims.UserID)
		return c.JSON(fiber.Map{
			"status":  "success",
			"message": "No prediction history found",
			"data":    []models.PredictionHistory{},
		})
	}

	return c.JSON(fiber.Map{
		"status":  "success",
		"message": "Prediction history retrieved successfully",
		"data":    histories,
	})
}

// GetPredictionHistoryByID retrieves a specific prediction history by ID for the authenticated user
func GetPredictionHistoryByID(c *fiber.Ctx) error {

	userClaims, ok := c.Locals("user").(*models.Claims)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"status":  "error",
			"message": "Unauthorized - invalid token",
		})
	}

	historyID := c.Params("id")
	objID, err := primitive.ObjectIDFromHex(historyID)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"status":  "error",
			"message": "Invalid history ID",
		})
	}

	collection := configs.GetCollection(configs.DB, "prediction_history")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var history models.PredictionHistory
	filter := bson.M{"_id": objID, "user_id": userClaims.UserID}
	err = collection.FindOne(ctx, filter).Decode(&history)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"status":  "error",
				"message": "History not found or not owned by user",
			})
		}
		log.Printf("Error: Failed to query prediction history - %v", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"status":  "error",
			"message": "Failed to retrieve prediction history",
		})
	}

	return c.JSON(fiber.Map{
		"status":  "success",
		"message": "Prediction history retrieved successfully",
		"data":    history,
	})
}

func DeleteHistory(c *fiber.Ctx) error {
	// Extract user claims from JWT token
	userClaims, ok := c.Locals("user").(*models.Claims)
	if !ok {
		log.Println("Error: Unauthorized - invalid token")
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"status":  "error",
			"message": "Unauthorized - invalid token",
		})
	}

	// Extract history ID from URL parameter
	historyID := c.Params("id")
	if historyID == "" {
		log.Println("Error: History ID is empty")
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"status":  "error",
			"message": "History ID is required",
		})
	}

	// Convert the history ID to a MongoDB ObjectID
	objID, err := primitive.ObjectIDFromHex(historyID)
	if err != nil {
		log.Printf("Error: Invalid history ID format - %s: %v", historyID, err)
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"status":  "error",
			"message": "Invalid history ID format",
		})
	}

	// Access the prediction_history collection
	collection := configs.GetCollection(configs.DB, "prediction_history")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Filter to ensure the history item belongs to the user
	filter := bson.M{
		"_id":     objID,
		"user_id": userClaims.UserID, // Use userClaims.UserID instead of userClaims.Id
	}

	// Attempt to delete the history item
	result, err := collection.DeleteOne(ctx, filter)
	if err != nil {
		log.Printf("Error: Failed to delete history item with ID %s for user %s: %v", historyID, userClaims.UserID, err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"status":  "error",
			"message": "Failed to delete history item",
		})
	}

	// Check if any document was deleted
	if result.DeletedCount == 0 {
		log.Printf("Warning: History item with ID %s not found or not owned by user %s", historyID, userClaims.UserID)
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"status":  "error",
			"message": "History item not found or not owned by user",
		})
	}

	log.Printf("Success: History item with ID %s deleted by user %s", historyID, userClaims.UserID)
	return c.JSON(fiber.Map{
		"status":  "success",
		"message": "History item deleted successfully",
	})
}
