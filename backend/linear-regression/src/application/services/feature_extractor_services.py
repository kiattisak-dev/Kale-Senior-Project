import cv2
import numpy as np
import pandas as pd
from skimage.feature import local_binary_pattern, graycomatrix, graycoprops
from src.domain.color_extractor import ColorExtractor
from src.domain.texture_extractor import TextureExtractor

class FeatureExtractor:
    @staticmethod
    def extract_features(image_bgr, image_gray):
        texture_features = TextureExtractor.texture_extractor(image_gray)
        color_features = ColorExtractor.color_extractor(image_bgr)
        return {**color_features, **texture_features}