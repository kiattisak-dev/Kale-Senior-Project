package models

import "github.com/golang-jwt/jwt"

type Claims struct {
	Email    string `json:"email"`
	Username string `json:"username"`
	UserID   string `json:"user_id"`
	jwt.StandardClaims
}
