package middleware

import (
	"backend-web/configs"
	"backend-web/models"
	"backend-web/utils"
	"errors"
	"log"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

func Protected() fiber.Handler {
	return func(c *fiber.Ctx) error {
        tokenStr := c.Cookies("token")
        if tokenStr == "" {
            authHeader := c.Get("Authorization")
            if authHeader != "" && len(authHeader) > 7 && authHeader[:7] == "Bearer " {
                tokenStr = authHeader[7:]
            }
        }

        if tokenStr == "" {
            return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
                "status":  "error",
                "message": "Token required",
                "data":    nil,
            })
        }

        // Parse token
        token, err := jwt.ParseWithClaims(tokenStr, &models.Claims{}, func(token *jwt.Token) (interface{}, error) {
            return []byte(configs.EnvSecret()), nil
        })
        if err != nil {
            return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
                "status":  "error",
                "message": "Invalid or expired JWT",
                "data":    nil,
            })
        }

        if !token.Valid {
            return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
                "status":  "error",
                "message": "Invalid or expired JWT",
                "data":    nil,
            })
        }

        if utils.IsTokenBlacklisted(tokenStr) {
            return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
                "status":  "error",
                "message": "Token is invalid or blacklisted",
                "data":    nil,
            })
        }

        claims, ok := token.Claims.(*models.Claims)
        if !ok {
            return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
                "status":  "error",
                "message": "Invalid token claims",
                "data":    nil,
            })
        }
        c.Locals("user", claims)

        return c.Next()
    }
}

func JWTAuthMiddleware(c *fiber.Ctx) error {
	tokenStr := c.Cookies("token")
	if tokenStr == "" {
		authHeader := c.Get("Authorization")
		if authHeader != "" && len(authHeader) > 7 && authHeader[:7] == "Bearer " {
			tokenStr = authHeader[7:]
		}
	}
	
	if tokenStr == "" {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"message": "Unauthorized: No token found",
		})
	}

	if utils.IsTokenBlacklisted(tokenStr) {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"message": "Unauthorized: Token is blacklisted",
		})
	}

	claims, err := ParseJWT(tokenStr)
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"message": "Unauthorized: Invalid token",
		})
	}

	c.Locals("user", claims)
	return c.Next()
}

func ParseJWT(tokenStr string) (*models.Claims, error) {
	token, err := jwt.ParseWithClaims(tokenStr, &models.Claims{}, func(token *jwt.Token) (interface{}, error) {
		return []byte(configs.EnvSecret()), nil
	})

	if err != nil {
		return nil, err
	}

	claims, ok := token.Claims.(*models.Claims)
	if !ok {
		return nil, errors.New("invalid token claims")
	}

	if claims.ExpiresAt < time.Now().Unix() {
		return nil, errors.New("token has expired")
	}

	rawClaims, ok := token.Claims.(jwt.MapClaims)
	if ok {
		if userID, exists := rawClaims["user_id"].(string); exists && userID != "" {
			if _, err := primitive.ObjectIDFromHex(userID); err != nil {
				log.Printf("Invalid user_id format in token claims: %s", userID)
				return nil, errors.New("invalid user_id format in token")
			}
			claims.UserID = userID
		} else {
			log.Printf("No valid user_id found in token claims: %+v", rawClaims)
			return nil, errors.New("missing or invalid user_id in token")
		}
	}

	return claims, nil
}
