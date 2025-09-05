package main

import (
	"backend-web/configs"
	"backend-web/middleware"
	"backend-web/routes"
	"fmt"

	"github.com/gofiber/fiber/v2"
)

func main() {
	app := fiber.New()

	app.Use(middleware.CorsMiddleware())
	

	configs.InitOAuth() 
    configs.ConnectDB()
	configs.InitIndexes()

	routes.OAuthRoute(app)
	routes.UserRoute(app)
	routes.PredictionRoute(app)
	routes.AuthUserRoute(app)
	routes.HistoryRoute(app)
	
	app.Static("/uploads", "./Uploads")
	app.Get("/", func(c *fiber.Ctx) error {
		return c.SendString("🚀 Welcome to Kale Senior Project Backend!")
	})
	
	port := configs.EnvPort()
	fmt.Println("🚀 Server running on port", port)
	app.Listen(":" + port)
}
