package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type User struct {
	Id                   primitive.ObjectID `bson:"_id"`
	Username             string             `gorm:"uniqueIndex;not null" json:"username"`
	Password             string             `json:"password" validate:"required"`
	Email                string             `json:"email" validate:"email, required"`
	EmailVerified        bool               `bson:"emailVerified" json:"emailVerified"`
	VerificationCode     string             `bson:"verificationCode" json:"-"`
	Avatar               primitive.ObjectID `bson:"avatar,omitempty" json:"avatar,omitempty"`
	CreatedAt            time.Time          `bson:"createdAt"`
	LastVerificationSent time.Time          `bson:"lastVerificationSent,omitempty"`
	ExpiresAt            time.Time          `bson:"expiresAt,omitempty"`
}
