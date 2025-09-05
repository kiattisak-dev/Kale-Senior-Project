package controllers

import (
	"context"
	"errors"
	"fmt"
	"log"
	"net/mail"
	"time"

	"backend-web/configs"
	"backend-web/models"
	"backend-web/utils"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"golang.org/x/crypto/bcrypt"
)

// CheckPasswordHash compares a password with its hash
func CheckPasswordHash(password, hash string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	return err == nil
}

// getUserByField retrieves a user by a specified field (e.g., email or username)
func getUserByField(field, value string) (*models.User, error) {
	collection := configs.GetCollection(configs.DB, "users")

	var user models.User
	err := collection.FindOne(context.TODO(), bson.M{field: value}).Decode(&user)
	if err != nil {
		if errors.Is(err, mongo.ErrNoDocuments) {
			return nil, nil
		}
		return nil, err
	}

	return &user, nil
}

// isEmail validates if a string is a valid email address
func isEmail(email string) bool {
	_, err := mail.ParseAddress(email)
	return err == nil
}

// GetUserInfo returns the authenticated user's information
func GetUserInfo(c *fiber.Ctx) error {
	userClaims, ok := c.Locals("user").(*models.Claims)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"status":  "error",
			"message": "Unauthorized - invalid token",
		})
	}

	userID := userClaims.UserID
	if userID == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"status":  "error",
			"message": "Invalid user ID",
		})
	}

	collection := configs.GetCollection(configs.DB, "users")
	var user models.User
	objID, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"status":  "error",
			"message": "Invalid user ID format",
		})
	}

	err = collection.FindOne(c.Context(), bson.M{"_id": objID}).Decode(&user)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"status":  "error",
			"message": "User not found",
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

// Login authenticates a user and returns a JWT token
func Login(c *fiber.Ctx) error {
	type LoginInput struct {
		Identity string `json:"identity"`
		Password string `json:"password"`
	}

	input := new(LoginInput)
	if err := c.BodyParser(input); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"status":  "error",
			"message": "Invalid request format",
			"data":    err.Error(),
		})
	}

	identity := input.Identity
	password := input.Password

	var user *models.User
	var err error

	if isEmail(identity) {
		user, err = getUserByField("email", identity)
	} else {
		user, err = getUserByField("username", identity)
	}

	if err != nil {
		log.Println("Database error:", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"status":  "error",
			"message": "Internal Server Error",
		})
	}
	if user == nil || !CheckPasswordHash(password, user.Password) {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"status":  "error",
			"message": "Invalid credentials",
		})
	}

	// Create JWT token
	token := jwt.New(jwt.SigningMethodHS256)
	claims := token.Claims.(jwt.MapClaims)
	claims["user_id"] = user.Id.Hex()
	claims["username"] = user.Username
	claims["exp"] = time.Now().Add(time.Hour * 72).Unix()

	// Retrieve JWT secret from environment
	secret := configs.EnvSecret()
	t, err := token.SignedString([]byte(secret))
	if err != nil {
		log.Println("JWT signing error:", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"status":  "error",
			"message": "Internal Server Error",
		})
	}

	return c.JSON(fiber.Map{
		"status":  "success",
		"message": "Login successful",
		"token":   t,
	})
}

// Logout blacklists the user's token
func Logout(c *fiber.Ctx) error {
	token := c.Get("Authorization")
	if token == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"status":  "error",
			"message": "Token required",
		})
	}

	err := utils.BlacklistToken(token, time.Hour*72)
	if err != nil {
		log.Println("Blacklist token error:", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"status":  "error",
			"message": "Failed to blacklist token",
		})
	}

	return c.JSON(fiber.Map{
		"status":  "success",
		"message": "Logged out successfully",
	})
}
