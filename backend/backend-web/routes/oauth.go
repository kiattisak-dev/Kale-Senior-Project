package routes

import (
	"backend-web/controllers/auth/third-party"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/logger"
)

func OAuthRoute(app *fiber.App) {
	api := app.Group("/api", logger.New())

	oauth := api.Group("/auth")
	oauth.Get("/oauth", controllers.OAuthLoginHandler)
	oauth.Get("/callback", controllers.OAuthCallbackHandler)
}
