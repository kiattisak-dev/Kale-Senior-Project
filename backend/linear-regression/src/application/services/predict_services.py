import pandas as pd
import numpy as np
from src.application.services.feature_extractor_services import FeatureExtractor
from src.infrastructure.model_loader import ModelLoader
from src.infrastructure.image_loader import ImageLoader


MODEL_PATH = "models/best_model.pkl"
model_loader = ModelLoader.load(MODEL_PATH)

if model_loader is None:
    raise ValueError(f"❌ Failed to load model from {MODEL_PATH}")

# Get model attributes
expected_features = model_loader.feature_names
scaler = model_loader.scaler

class PredictService:
    
    @staticmethod
    def predict_image(image: bytes): 
        image, image_gray = ImageLoader.load(image)
        extracted_features = FeatureExtractor.extract_features(image, image_gray)
        matched_features = {feature: extracted_features.get(feature, 0.0) for feature in expected_features}
        prediction = model_loader.predict(pd.DataFrame([matched_features]))

        return {"percentage_weight_lose":prediction[0], "features":matched_features}