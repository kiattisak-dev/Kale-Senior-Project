package utils

import (
	"fmt"
	"strconv"
	"math/rand"

	"backend-web/configs"
	"github.com/sendgrid/sendgrid-go"
	"github.com/sendgrid/sendgrid-go/helpers/mail"
)

func SendEmailVerification(email, verificationCode string, isReset bool) error {

	senderEmail := configs.EnvSendgridEmail()
	if senderEmail == "" {
		return fmt.Errorf("sender email not configured")
	}

	apiKey := configs.EnvSendgridAPIKey()
	if apiKey == "" {
		return fmt.Errorf("SendGrid API key not configured")
	}

	from := mail.NewEmail("Kale Project", senderEmail)
	subject := "Please verify your email address"
	if isReset {
		subject = "Password Reset OTP"
	}
	to := mail.NewEmail("", email)
	plainTextContent := "Your verification code is: " + verificationCode
	htmlContent := "<strong>Your verification code is: " + verificationCode + "</strong>"
	if isReset {
		plainTextContent = "Your password reset OTP is: " + verificationCode
		htmlContent = "<strong>Your password reset OTP is: " + verificationCode + "</strong>"
	}
	message := mail.NewSingleEmail(from, subject, to, plainTextContent, htmlContent)

	client := sendgrid.NewSendClient(apiKey)
	response, err := client.Send(message)
	if err != nil {
		return err
	}

	fmt.Println("SendGrid Response:", response.StatusCode)
	return nil
}

func GenerateVerificationCode() string {
	return strconv.Itoa(100000 + rand.Intn(900000))
}
