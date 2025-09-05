package controllers

import (
	"context"
	"log"
	"time"

	"backend-web/configs"
	"backend-web/models"
	"backend-web/utils"

	"github.com/gofiber/fiber/v2"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"golang.org/x/crypto/bcrypt"
)

// Register creates a new user account
func Register(c *fiber.Ctx) error {
	type RegisterInput struct {
		Username string `json:"username"`
		Password string `json:"password"`
		Email    string `json:"email"`
	}

	input := new(RegisterInput)
	if err := c.BodyParser(input); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"status":  "error",
			"message": "Invalid input",
			"data":    err.Error(),
		})
	}

	if input.Username == "" || input.Password == "" || !isEmail(input.Email) {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"status":  "error",
			"message": "All fields are required and must be valid",
		})
	}

	// Check if username exists
	existingUser, _ := getUserByField("username", input.Username)
	if existingUser != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"status":  "error",
			"message": "Username already taken",
		})
	}

	// Check if email exists
	existingUser, _ = getUserByField("email", input.Email)
	if existingUser != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"status":  "error",
			"message": "Email already in use",
		})
	}

	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)
	if err != nil {
		log.Println("Error hashing password:", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"status":  "error",
			"message": "Error hashing password",
		})
	}

	// Generate verification code
	verificationCode := utils.GenerateVerificationCode()

	newUser := models.User{
		Id:               primitive.NewObjectID(),
		Username:         input.Username,
		Password:         string(hashedPassword),
		Email:            input.Email,
		CreatedAt:        time.Now(),
		EmailVerified:    false,
		VerificationCode: verificationCode,
		ExpiresAt:        time.Now().Add(10 * time.Minute),
	}

	collection := configs.GetCollection(configs.DB, "users")
	_, err = collection.InsertOne(context.TODO(), newUser)
	if err != nil {
		log.Println("Error inserting user:", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"status":  "error",
			"message": "Could not register user",
		})
	}

	// Send verification email
	if err := utils.SendEmailVerification(input.Email, verificationCode, false); err != nil {
		log.Println("Error sending verification email:", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"status":  "error",
			"message": "Failed to send verification email",
		})
	}

	return c.JSON(fiber.Map{
		"status":  "success",
		"message": "Registration successful. Please check your email for the verification code.",
	})
}

// VerifyEmail verifies the user's email with a verification code
func VerifyEmail(c *fiber.Ctx) error {
	type VerifyInput struct {
		Email            string `json:"email"`
		VerificationCode string `json:"verificationCode"`
	}

	input := new(VerifyInput)
	if err := c.BodyParser(input); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"status":  "error",
			"message": "Invalid request format",
			"data":    err.Error(),
		})
	}

	// Check if user exists and verification code matches
	user, err := getUserByField("email", input.Email)
	if err != nil {
		log.Println("Database error:", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"status":  "error",
			"message": "Error checking user",
		})
	}
	if user == nil || user.VerificationCode != input.VerificationCode {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"status":  "error",
			"message": "Invalid verification code",
		})
	}

	// Check if verification code has expired
	if time.Now().After(user.ExpiresAt) {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"status":  "error",
			"message": "Verification code has expired",
		})
	}

	// Mark email as verified
	collection := configs.GetCollection(configs.DB, "users")
	res, err := collection.UpdateOne(
		context.TODO(),
		bson.M{"email": input.Email},
		bson.M{
			"$set":   bson.M{"emailVerified": true},
			"$unset": bson.M{"expiresAt": "", "verificationCode": ""},
		},
	)
	if err != nil {
		log.Println("Error verifying email:", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"status":  "error",
			"message": "Error verifying email",
		})
	}
	log.Println("Matched:", res.MatchedCount, "Modified:", res.MatchedCount)

	return c.JSON(fiber.Map{
		"status":  "success",
		"message": "Email verified successfully",
	})
}

// ResendVerification resends a verification email to the user
func ResendVerification(c *fiber.Ctx) error {
	type Input struct {
		Email string `json:"email"`
	}

	input := new(Input)
	if err := c.BodyParser(input); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"status":  "error",
			"message": "Invalid request format",
		})
	}

	if !isEmail(input.Email) {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"status":  "error",
			"message": "Invalid email address",
		})
	}

	user, err := getUserByField("email", input.Email)
	if err != nil {
		log.Println("Database error:", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"status":  "error",
			"message": "Database error",
		})
	}
	if user == nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"status":  "error",
			"message": "User not found",
		})
	}

	if user.EmailVerified {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"status":  "error",
			"message": "Email already verified",
		})
	}

	// Cooldown check (60 seconds)
	if time.Since(user.LastVerificationSent) < time.Minute {
		return c.Status(fiber.StatusTooManyRequests).JSON(fiber.Map{
			"status":  "error",
			"message": "Please wait before resending verification email",
		})
	}

	// Generate new code
	newCode := utils.GenerateVerificationCode()
	now := time.Now()
	collection := configs.GetCollection(configs.DB, "users")

	_, err = collection.UpdateOne(
		context.TODO(),
		bson.M{"email": user.Email},
		bson.M{
			"$set": bson.M{
				"verificationCode":     newCode,
				"lastVerificationSent": now,
				"expiresAt":            now.Add(10 * time.Minute),
			},
		},
	)
	if err != nil {
		log.Println("Error updating verification code:", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"status":  "error",
			"message": "Failed to update verification code",
		})
	}

	// Send email
	if err := utils.SendEmailVerification(user.Email, newCode, false); err != nil {
		log.Println("Error sending verification email:", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"status":  "error",
			"message": "Failed to send verification email",
		})
	}

	return c.JSON(fiber.Map{
		"status":  "success",
		"message": "Verification email resent successfully",
	})
}