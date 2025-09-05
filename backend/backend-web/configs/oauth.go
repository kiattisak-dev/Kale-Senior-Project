package configs

import (
	"log"
	"os"

	"github.com/joho/godotenv"
	"golang.org/x/oauth2"
	"golang.org/x/oauth2/google"
)

var OAuthConfig *oauth2.Config

func InitOAuth() {
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}

	clientID := os.Getenv("CLIENT_ID")
	clientSecret := os.Getenv("CLIENT_SECRET")
	redirectURI := os.Getenv("REDIRECT_URI")

	if clientID == "" || clientSecret == "" || redirectURI == "" {
		log.Fatal("Missing CLIENT_ID, CLIENT_SECRET or REDIRECT_URI")
	}

	OAuthConfig = &oauth2.Config{
		ClientID:     clientID,
		ClientSecret: clientSecret,
		RedirectURL:  redirectURI,
		Scopes:       []string{"email", "profile"},
		Endpoint:     google.Endpoint,
	}
}

func GoogleOAuthConfig() *oauth2.Config {
	if OAuthConfig == nil {
		log.Fatal("OAuth config is not initialized. Call InitOAuth() first.")
	}
	return OAuthConfig
}