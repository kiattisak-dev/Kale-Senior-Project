package configs

import (
	"context"
	"fmt"
	"log"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/gridfs"
	"go.mongodb.org/mongo-driver/mongo/options"
)

func ConnectDB() *mongo.Client {
	client, err := mongo.NewClient(options.Client().ApplyURI(EnvMongoURI()))
	if err != nil {
		log.Fatal(err)
	}

	ctx, _ := context.WithTimeout(context.Background(), 10*time.Second)
	err = client.Connect(ctx)
	if err != nil {
		log.Fatal(err)
	}

	err = client.Ping(ctx, nil)
	if err != nil {
		log.Fatal(err)
	}
	fmt.Println("Connected to MongoDB")
	return client
}

var DB *mongo.Client = ConnectDB()

func GetCollection(client *mongo.Client, collectionName string) *mongo.Collection {
	collection := client.Database("KaleAPI").Collection(collectionName)
	return collection
}

// GetGridFSBucket creates a GridFS bucket for managing files.
func GetGridFSBucket(client *mongo.Client) *gridfs.Bucket {
	db := client.Database("KaleAPI")
	bucket, err := gridfs.NewBucket(db)
	if err != nil {
		log.Fatal("Failed to create GridFS bucket:", err)
	}
	return bucket
}

func InitUserIndexes() {
	collection := GetCollection(DB, "users")

	_, err := collection.Indexes().DropOne(context.TODO(), "expiresAt_1")

	indexModel := mongo.IndexModel{
		Keys: bson.D{{Key: "expiresAt", Value: 1}},
		Options: options.Index().SetExpireAfterSeconds(0),
	}

	_, err = collection.Indexes().CreateOne(context.TODO(), indexModel)
	if err != nil {
		log.Println("⚠️ Failed to create TTL index:", err)
	} else {
		log.Println("✅ TTL index created on 'expiresAt' field")
	}
}

func InitPasswordResetIndexes() {
	collection := GetCollection(DB, "password_resets")

	// Drop existing TTL index if any
	_, err := collection.Indexes().DropOne(context.TODO(), "expiresAt_1")
	if err != nil && err != mongo.ErrNoDocuments {
		log.Println("⚠️ Error dropping existing TTL index:", err)
	}

	// Create TTL index on expiresAt
	indexModel := mongo.IndexModel{
		Keys:    bson.D{{Key: "expiresAt", Value: 1}},
		Options: options.Index().SetExpireAfterSeconds(0),
	}

	_, err = collection.Indexes().CreateOne(context.TODO(), indexModel)
	if err != nil {
		log.Println("⚠️ Failed to create TTL index for password_resets:", err)
	} else {
		log.Println("✅ TTL index created on 'expiresAt' for password_resets")
	}
}

func InitPredictionHistoryIndexes() {
    collection := GetCollection(DB, "prediction_history")

    indexModel := mongo.IndexModel{
        Keys: bson.D{{Key: "user_id", Value: 1}},
    }

    _, err := collection.Indexes().CreateOne(context.TODO(), indexModel)
    if err != nil {
        log.Println("⚠️ Failed to create index on user_id:", err)
    } else {
        log.Println("✅ Index created on 'user_id' for prediction_history")
    }
}

func InitIndexes() {
	InitPasswordResetIndexes()
	InitUserIndexes()
	InitPredictionHistoryIndexes()
}