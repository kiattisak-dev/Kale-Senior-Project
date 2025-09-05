import tensorflow as tf 
import logging

logger = logging.getLogger(__name__)

class ModelLoader:
    MODEL_PATH = "models/deeplabv3_trained.keras"
    
    def __init__(self):
        try:
            self.model = tf.keras.models.load_model(self.MODEL_PATH)
            logger.info(f"✅ Model successfully loaded from {self.MODEL_PATH}")
            self.model.summary()
        except Exception as e:
            logger.error(f"❌ Failed to load model: {e}")
            raise RuntimeError(f"Failed to load model: {e}")
        
    def predict(self, image):
        return self.model.predict(input_data)[0]