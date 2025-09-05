import joblib

class ModelLoader:
    def __init__(self, model, scaler=None, feature_names=None):
        self.model = model
        self.scaler = scaler
        self.feature_names = feature_names

    def fit(self, X, y):
        if self.scaler:
            X_scaled = self.scaler.fit_transform(X)
        else:
            X_scaled = X  # If no scaler, use raw data
        self.model.fit(X_scaled, y)

    def predict(self, X):
        if self.scaler:
            X_scaled = self.scaler.transform(X)
        else:
            X_scaled = X  # If no scaler, use raw data
        return self.model.predict(X_scaled)

    def save(self, filepath):
        """Save the model, scaler, and feature names with Joblib"""
        with open(filepath, "wb") as f:
            joblib.dump({
                "model": self.model,
                "scaler": self.scaler,
                "feature_names": self.feature_names
            }, f)
        print(f"✅ Model saved at {filepath}")

    @classmethod
    def load(cls, filepath):
        """Load the model with its scaler and feature names"""
        try:
            with open(filepath, "rb") as f:
                data = joblib.load(f)
            return cls(
                model=data["model"],
                scaler=data["scaler"],
                feature_names=data["feature_names"]
            )
        except Exception as e:
            print(f"❌ Error loading model: {e}")
            return None
