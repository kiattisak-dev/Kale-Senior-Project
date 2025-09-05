package routes

import (
	"backend-web/controllers"
	"backend-web/middleware"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/logger"
)

func UserRoute(app *fiber.App) {
	api := app.Group("/api", logger.New())

	user := api.Group("/user")
	user.Get("/:id", middleware.Protected(), controllers.GetUser)
	user.Patch("/:id", middleware.Protected(), controllers.UpdateUser)
	user.Post("/avatar", middleware.Protected(), controllers.UploadAvatar)
	user.Get("/avatar/:fileId", controllers.GetAvatar)
}
