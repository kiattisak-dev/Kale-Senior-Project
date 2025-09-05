import joblib
import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))
from src.infrastructure.model_loader import LoadModel
# Load model
model = LoadModel.load("model.pkl")

# Print feature names
if hasattr(model, "feature_names"):
    print("✅ Model was trained with these features:", model.feature_names)
else:
    print("⚠️ Model does NOT have feature names. Check training data.")
