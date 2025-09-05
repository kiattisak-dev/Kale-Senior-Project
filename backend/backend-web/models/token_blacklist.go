package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type BlacklistedToken struct {
	ID        primitive.ObjectID `bson:"_id,omitempty"`
	Token     string             `bson:"token"`
	ExpiredAt time.Time          `bson:"expired_at"`
}