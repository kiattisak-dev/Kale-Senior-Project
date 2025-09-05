import cv2
import numpy as np
from skimage.feature import graycomatrix, graycoprops, local_binary_pattern

class TextureExtractor:
    GLCM_PROPS = ['contrast', 'dissimilarity', 'homogeneity', 'energy', 'correlation', 'ASM']

    @staticmethod
    def extract_glcm_features(image_gray):
        """Extracts GLCM features from a grayscale image."""
        glcm = graycomatrix(image_gray, distances=[1], angles=[0], levels=256, symmetric=True, normed=True)
        return {f"GLCM_{prop}": float(graycoprops(glcm, prop).flatten()[0]) for prop in TextureExtractor.GLCM_PROPS}

    @staticmethod
    def extract_lbp_features(image_gray):
        """Extracts Local Binary Pattern (LBP) histogram features."""
        lbp = local_binary_pattern(image_gray, P=8, R=1, method="uniform")
        hist, _ = np.histogram(lbp.ravel(), bins=np.arange(0, 11), range=(0, 10))
        return {f"LBP_{i}": float(hist[i]) for i in range(10)}

    @staticmethod
    def texture_extractor(image_gray):
        """Extracts texture features from an image."""
        if image_gray is None:
            raise ValueError(f"Image at could not be loaded.")
        
        glcm_features = TextureExtractor.extract_glcm_features(image_gray)
        lbp_features = TextureExtractor.extract_lbp_features(image_gray)
        return {**glcm_features, **lbp_features}
