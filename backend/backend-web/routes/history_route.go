package routes

import (
	"backend-web/controllers"
	"backend-web/middleware"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/logger"
)

func HistoryRoute(app *fiber.App) {

	api := app.Group("/api", logger.New())

	history := api.Group("/history")
	history.Use(middleware.Protected())

	history.Get("/", controllers.GetPredictionHistory)
	history.Get("/:id", controllers.GetPredictionHistoryByID)
	history.Delete("/:id", controllers.DeleteHistory)
}
