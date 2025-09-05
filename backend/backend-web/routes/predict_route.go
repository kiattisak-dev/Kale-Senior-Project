package routes

import (
	"backend-web/controllers"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/logger"
)

func PredictionRoute(app *fiber.App) {
	api := app.Group("/api", logger.New())
	api.Post("/predict", controllers.PredictHandler)
	api.Get("/image/:fileId", controllers.GetImage)
}
