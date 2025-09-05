import cv2
import numpy as np

class ImageLoader:
    """Efficiently handles image loading from bytes for fast processing."""

    @staticmethod
    def load(image_bytes: bytes):
        """Loads an image from bytes and converts it to BGR & grayscale format."""

        image_array = np.frombuffer(image_bytes, dtype=np.uint8)
        image = cv2.imdecode(image_array, cv2.IMREAD_UNCHANGED)
        image_gray = cv2.imdecode(image_array, cv2.IMREAD_GRAYSCALE)
        
        return image, image_gray