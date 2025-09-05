package controllers

import (
	"context"
	"errors"
	"log"
	"time"

	"backend-web/configs"
	"backend-web/utils"

	"github.com/gofiber/fiber/v2"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"golang.org/x/crypto/bcrypt"
)

// ForgotPassword initiates a password reset by sending an OTP
func ForgotPassword(c *fiber.Ctx) error {
	type ForgotInput struct {
		Email string `json:"email"`
	}

	input := new(ForgotInput)
	if err := c.BodyParser(input); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"status":  "error",
			"message": "Invalid request format",
			"data":    err.Error(),
		})
	}

	if !isEmail(input.Email) {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"status":  "error",
			"message": "Invalid email address",
		})
	}

	// Check if user exists
	user, err := getUserByField("email", input.Email)
	if err != nil {
		log.Println("Database error:", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"status":  "error",
			"message": "Internal Server Error",
		})
	}
	if user == nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"status":  "error",
			"message": "User not found",
		})
	}

	// Check if email is verified
	if !user.EmailVerified {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"status":  "error",
			"message": "Email not verified. Please verify your email before resetting password.",
		})
	}

	// Cooldown check (60 seconds)
	collection := configs.GetCollection(configs.DB, "password_resets")
	existing := collection.FindOne(context.TODO(), bson.M{
		"email":     input.Email,
		"createdAt": bson.M{"$gt": time.Now().Add(-time.Minute)},
	})
	if existing.Err() == nil {
		return c.Status(fiber.StatusTooManyRequests).JSON(fiber.Map{
			"status":  "error",
			"message": "Please wait before requesting another OTP",
		})
	}
	// Delete old unused OTPs for this email
	_, err = collection.DeleteMany(context.TODO(), bson.M{
		"email": input.Email,
		"used":  false,
	})
	if err != nil {
		log.Println("Error deleting old OTPs:", err)
	}

	// Generate OTP
	otp := utils.GenerateVerificationCode()

	// Store OTP in password_resets collection
	resetEntry := bson.M{
		"email":            input.Email,
		"verificationCode": otp,
		"expiresAt":        time.Now().Add(10 * time.Minute),
		"used":             false,
		"createdAt":        time.Now(),
	}

	_, err = collection.InsertOne(context.TODO(), resetEntry)
	if err != nil {
		log.Println("Error storing reset token:", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"status":  "error",
			"message": "Could not initiate password reset",
		})
	}

	// Send OTP via email
	if err := utils.SendEmailVerification(input.Email, otp, true); err != nil {
		log.Println("Error sending reset email:", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"status":  "error",
			"message": "Failed to send reset email",
		})
	}

	return c.JSON(fiber.Map{
		"status":  "success",
		"message": "Password reset OTP sent. Please check your email.",
	})
}

// VerifyResetOTP verifies the OTP for password reset
func VerifyResetOTP(c *fiber.Ctx) error {
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

	if !isEmail(input.Email) {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"status":  "error",
			"message": "Invalid email address",
		})
	}

	// Check if user exists and email is verified
	user, err := getUserByField("email", input.Email)
	if err != nil {
		log.Println("Database error:", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"status":  "error",
			"message": "Error checking user",
		})
	}
	if user == nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"status":  "error",
			"message": "User not found",
		})
	}
	if !user.EmailVerified {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"status":  "error",
			"message": "Email not verified. Please verify your email before resetting password.",
		})
	}

	// Check OTP in password_resets collection
	collection := configs.GetCollection(configs.DB, "password_resets")
	var resetEntry struct {
		Email            string    `bson:"email"`
		VerificationCode string    `bson:"verificationCode"`
		ExpiresAt        time.Time `bson:"expiresAt"`
		Used             bool      `bson:"used"`
	}
	err = collection.FindOne(context.TODO(), bson.M{
		"email":            input.Email,
		"verificationCode": input.VerificationCode,
		"used":             false,
	}).Decode(&resetEntry)
	if err != nil {
		if errors.Is(err, mongo.ErrNoDocuments) {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"status":  "error",
				"message": "Invalid or expired OTP",
			})
		}
		log.Println("Database error:", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"status":  "error",
			"message": "Error verifying OTP",
		})
	}

	if time.Now().After(resetEntry.ExpiresAt) {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"status":  "error",
			"message": "OTP has expired",
		})
	}

	// Mark OTP as verified
	_, err = collection.UpdateOne(
		context.TODO(),
		bson.M{"email": input.Email, "verificationCode": input.VerificationCode},
		bson.M{"$set": bson.M{"used": true}},
	)
	if err != nil {
		log.Println("Error marking OTP as used:", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"status":  "error",
			"message": "Error verifying OTP",
		})
	}

	return c.JSON(fiber.Map{
		"status":  "success",
		"message": "OTP verified successfully. You can now reset your password.",
	})
}

// ResetPassword updates the user's password after OTP verification
func ResetPassword(c *fiber.Ctx) error {
	type ResetInput struct {
		Email       string `json:"email"`
		NewPassword string `json:"newPassword"`
	}

	input := new(ResetInput)
	if err := c.BodyParser(input); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"status":  "error",
			"message": "Invalid request format",
			"data":    err.Error(),
		})
	}

	if !isEmail(input.Email) {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"status":  "error",
			"message": "Invalid email address",
		})
	}

	if input.NewPassword == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"status":  "error",
			"message": "New password is required",
		})
	}

	// Check if user exists and email is verified
	user, err := getUserByField("email", input.Email)
	if err != nil {
		log.Println("Database error:", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"status":  "error",
			"message": "Internal Server Error",
		})
	}
	if user == nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"status":  "error",
			"message": "User not found",
		})
	}
	if !user.EmailVerified {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"status":  "error",
			"message": "Email not verified. Please verify your email before resetting password.",
		})
	}

	// Check if a verified OTP exists
	collection := configs.GetCollection(configs.DB, "password_resets")
	var resetEntry struct {
		Email string `bson:"email"`
		Used  bool   `bson:"used"`
	}
	err = collection.FindOne(context.TODO(), bson.M{
		"email": input.Email,
		"used":  true,
	}).Decode(&resetEntry)
	if err != nil {
		if errors.Is(err, mongo.ErrNoDocuments) {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"status":  "error",
				"message": "No verified OTP found. Please verify OTP first.",
			})
		}
		log.Println("Database error:", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"status":  "error",
			"message": "Error checking OTP",
		})
	}

	// Hash new password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(input.NewPassword), bcrypt.DefaultCost)
	if err != nil {
		log.Println("Error hashing password:", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"status":  "error",
			"message": "Error processing password",
		})
	}

	// Update user password
	userCollection := configs.GetCollection(configs.DB, "users")
	_, err = userCollection.UpdateOne(
		context.TODO(),
		bson.M{"email": input.Email},
		bson.M{"$set": bson.M{"password": string(hashedPassword)}},
	)
	if err != nil {
		log.Println("Error updating password:", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"status":  "error",
			"message": "Failed to update password",
		})
	}

	// Clean up used OTPs
	_, err = collection.DeleteMany(context.TODO(), bson.M{
		"email": input.Email,
		"used":  true,
	})
	if err != nil {
		log.Println("Error cleaning up OTPs:", err)
		// Continue despite this error to avoid blocking the user
	}

	return c.JSON(fiber.Map{
		"status":  "success",
		"message": "Password reset successfully",
	})
}

// ResendResetOTP resends a password reset OTP
func ResendResetOTP(c *fiber.Ctx) error {
	type ResendInput struct {
		Email string `json:"email"`
	}

	input := new(ResendInput)
	if err := c.BodyParser(input); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"status":  "error",
			"message": "Invalid request format",
			"data":    err.Error(),
		})
	}

	if !isEmail(input.Email) {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"status":  "error",
			"message": "Invalid email address",
		})
	}

	// Check if user exists
	user, err := getUserByField("email", input.Email)
	if err != nil {
		log.Println("Database error:", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"status":  "error",
			"message": "Internal Server Error",
		})
	}
	if user == nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"status":  "error",
			"message": "Email not found. Please check your email address.",
		})
	}

	// Check if email is verified
	if !user.EmailVerified {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"status":  "error",
			"message": "Email not verified. Please verify your email first.",
		})
	}

	// Cooldown check (60 seconds)
	collection := configs.GetCollection(configs.DB, "password_resets")
	existing := collection.FindOne(context.TODO(), bson.M{
		"email":     input.Email,
		"createdAt": bson.M{"$gt": time.Now().Add(-time.Minute)},
	})
	if existing.Err() == nil {
		return c.Status(fiber.StatusTooManyRequests).JSON(fiber.Map{
			"status":  "error",
			"message": "Too many requests. Please wait before trying again.",
		})
	}

	// Delete old unused OTPs for this email
	_, err = collection.DeleteMany(context.TODO(), bson.M{
		"email": input.Email,
		"used":  false,
	})
	if err != nil {
		log.Println("Error deleting old OTPs:", err)
	}

	// Generate new OTP
	otp := utils.GenerateVerificationCode()

	// Store OTP in password_resets collection
	resetEntry := bson.M{
		"email":            input.Email,
		"verificationCode": otp,
		"expiresAt":        time.Now().Add(10 * time.Minute),
		"used":             false,
		"createdAt":        time.Now(),
	}

	_, err = collection.InsertOne(context.TODO(), resetEntry)
	if err != nil {
		log.Println("Error storing reset token:", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"status":  "error",
			"message": "Could not initiate OTP resend",
		})
	}

	// Send OTP via email
	if err := utils.SendEmailVerification(input.Email, otp, true); err != nil {
		log.Println("Error sending reset email:", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"status":  "error",
			"message": "Failed to send reset email",
		})
	}

	return c.JSON(fiber.Map{
		"status":  "success",
		"message": "A new OTP has been sent to your email.",
	})
}