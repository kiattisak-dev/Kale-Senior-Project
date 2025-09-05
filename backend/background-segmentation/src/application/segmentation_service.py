import numpy as np
import cv2
import tensorflow as tf
from src.domain.image_processing import resize_with_padding  # ✅ นำเข้าให้ใช้ตรง ๆ

class SegmentationService:
    @staticmethod
    def preprocessing_img(image: np.ndarray, target_size=(512, 512)):
        image = resize_with_padding(image, target_size[0])
        image = image.astype("float32") / 255.0
        return np.expand_dims(image, axis=0)

    @staticmethod
    def segment_image(image: np.ndarray, model_loader):
        model = model_loader.model  # โหลดโมเดล
        image = SegmentationService.preprocessing_img(image)
        mask = model.predict(image)[0]
        mask = np.argmax(mask, axis=-1)
        mask = (mask > 0.5).astype(np.uint8) * 255
        return mask

    @staticmethod
    def remove_background(image: np.ndarray, mask: np.ndarray):
        image = cv2.cvtColor(image, cv2.COLOR_RGB2RGBA)
        image[:, :, 3] = mask  # ใช้ mask เป็น alpha channel
        return image
