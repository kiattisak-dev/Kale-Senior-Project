package controllers

import (
	"context"
	"encoding/json"
	"log"
	"time"

	"backend-web/configs"
	"backend-web/models"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"golang.org/x/oauth2"
)

func OAuthLoginHandler(c *fiber.Ctx) error {
	url := configs.GoogleOAuthConfig().AuthCodeURL("random-state-token", oauth2.AccessTypeOffline)
	return c.Redirect(url)
}

func OAuthCallbackHandler(c *fiber.Ctx) error {
    code := c.Query("code")
    if code == "" {
        return c.Status(fiber.StatusBadRequest).SendString("Missing code")
    }

    // Exchange code for token
    token, err := configs.GoogleOAuthConfig().Exchange(context.Background(), code)
    if err != nil {
        log.Println("Token exchange error:", err)
        return c.Status(fiber.StatusBadRequest).SendString("Token exchange error: " + err.Error())
    }

    client := configs.GoogleOAuthConfig().Client(context.Background(), token)
    resp, err := client.Get("https://www.googleapis.com/oauth2/v2/userinfo")
    if err != nil {
        log.Println("User info error:", err)
        return c.Status(fiber.StatusInternalServerError).SendString("User info error: " + err.Error())
    }
    defer resp.Body.Close()

    var userData struct {
        ID      string `json:"id"`
        Email   string `json:"email"`
        Name    string `json:"name"`
        Picture string `json:"picture"`
    }
    if err := json.NewDecoder(resp.Body).Decode(&userData); err != nil {
        log.Println("JSON decode error:", err)
        return c.Status(fiber.StatusInternalServerError).SendString("JSON decode error: " + err.Error())
    }

    userCollection := configs.GetCollection(configs.DB, "users")
    var existingUser models.User
    err = userCollection.FindOne(context.TODO(), bson.M{"email": userData.Email}).Decode(&existingUser)

    if err != nil {
        newUser := models.User{
            Id:            primitive.NewObjectID(),
            Username:      userData.Name,
            Password:      "",
            Email:         userData.Email,
            EmailVerified: true,
            CreatedAt:     time.Now(),
        }

        _, insertErr := userCollection.InsertOne(context.TODO(), newUser)
        if insertErr != nil {
            log.Println("Error inserting new user:", insertErr)
            return c.Status(fiber.StatusInternalServerError).SendString("Failed to create user")
        }
        existingUser = newUser
    }

    userID := existingUser.Id.Hex()

    // Generate JWT token
    jwtToken := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
        "email":    userData.Email,
        "username": userData.Name,
        "exp":      time.Now().Add(time.Hour * 72).Unix(),
        "user_id":  userID,
    })
    tokenString, err := jwtToken.SignedString([]byte(configs.EnvSecret()))
    if err != nil {
        log.Println("JWT signing error:", err)
        return c.Status(fiber.StatusInternalServerError).SendString("JWT signing error: " + err.Error())
    }

    // Set cookie
    c.Cookie(&fiber.Cookie{
        Name:     "token",
        Value:    tokenString,
        Expires:  time.Now().Add(time.Hour * 72),
        HTTPOnly: false,
        Secure:   false,
        SameSite: "Lax",
    })

    // Set refresh token cookie (optional)
    if refreshToken := token.RefreshToken; refreshToken != "" {
        c.Cookie(&fiber.Cookie{
            Name:     "refresh_token",
            Value:    refreshToken,
            Expires:  time.Now().Add(time.Hour * 24 * 30),
            HTTPOnly: true,
            Secure:   false,
            SameSite: "Lax",
        })
    }

    return c.Redirect("http://localhost:3000/auth/oauth-callback")
}