package routes

import (
	"backend-web/controllers/auth/auth-login"
	"backend-web/middleware"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/limiter"
	"github.com/gofiber/fiber/v2/middleware/logger"
)

func AuthUserRoute(app *fiber.App) {
	api := app.Group("/api", logger.New())

	auth := api.Group("/auth")
	auth.Post("/login", controllers.Login)
	auth.Post("/register", controllers.Register)
	auth.Post("/verify-email", controllers.VerifyEmail)
	auth.Post("/resend-otp", controllers.ResendVerification)

	//reset-password
	auth.Post("/forgot-password", limiter.New(limiter.Config{
		Max:        5,
		Expiration: 1 * time.Minute,
	}), controllers.ForgotPassword)
	auth.Post("/verify-reset-otp", limiter.New(limiter.Config{
		Max:        5,
		Expiration: 1 * time.Minute,
	}), controllers.VerifyResetOTP)
	auth.Post("/resend-reset-otp", limiter.New(limiter.Config{
		Max:        5,
		Expiration: 1 * time.Minute,
	}), controllers.ResendResetOTP)
	auth.Post("/reset-password", controllers.ResetPassword)

	auth.Post("/logout", middleware.JWTAuthMiddleware, controllers.Logout)
	auth.Get("/user", middleware.JWTAuthMiddleware, controllers.GetUserInfo)
}
