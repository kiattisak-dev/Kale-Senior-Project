package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type PredictionHistory struct {
	ID         primitive.ObjectID     `bson:"_id,omitempty" json:"_id"`
	UserID     string                 `bson:"user_id"`
	FileName   string                 `bson:"file_name"`
	Percentage float64                `bson:"percentage_weight_lose"`
	ImageUrl   string                 `bson:"ImageUrl" json:"ImageUrl"`
	Features   map[string]interface{} `bson:"features"`
	Timestamp  time.Time              `bson:"timestamp"`
}
