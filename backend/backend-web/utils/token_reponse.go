package utils

import (
	"context"
	"backend-web/configs"
	"backend-web/models"
	"time"

	"go.mongodb.org/mongo-driver/bson"
)

func BlacklistToken(token string, expiration time.Duration) error {
	collection := configs.GetCollection(configs.DB, "blacklisted_tokens")

	_, err := collection.InsertOne(context.TODO(), models.BlacklistedToken{
		Token:     token,
		ExpiredAt: time.Now().Add(expiration),
	})
	return err
}

func IsTokenBlacklisted(token string) bool {
	collection := configs.GetCollection(configs.DB, "blacklisted_tokens")

	var result models.BlacklistedToken
	err := collection.FindOne(context.TODO(), bson.M{"token": token}).Decode(&result)
	return err == nil
}
