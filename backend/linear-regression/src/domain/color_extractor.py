import cv2
import numpy as np

class ColorExtractor:
    
    COLOR_SPACES = {
        "RGB": (None, ["R", "G", "B"]),
        "LAB": (cv2.COLOR_BGR2LAB, ["L", "A", "B"]),
        "HSV": (cv2.COLOR_BGR2HSV, ["H", "S", "V"]),
        "GRAY": (cv2.COLOR_BGR2GRAY, ["Gray"])
    }

    @staticmethod
    def extract_color(image, conversion_code):
        if conversion_code is not None:
            img = cv2.cvtColor(image, conversion_code)
        else:
            img = image  # Keep as RGB
        
        # Ensure grayscale images have a correct shape
        if len(img.shape) == 2:  # If grayscale, expand dimensions
            img = np.expand_dims(img, axis=-1)

        # Compute mean & std per channel
        means = np.mean(img, axis=(0, 1))
        stds = np.std(img, axis=(0, 1))

        # Ensure it's always a 1D array before concatenation
        return np.concatenate([means.flatten(), stds.flatten()]).astype(float)

    @staticmethod
    def color_extractor(image):
        """Extract mean and standard deviation of color statistics from an image."""
        if image is None:
            raise ValueError("Image could not be loaded.")

        color_stats = {}
        rgb_means = None

        for space, (conv, channels) in ColorExtractor.COLOR_SPACES.items():
            stats = ColorExtractor.extract_color(image, conv)
            for i, channel in enumerate(channels):
                color_stats[f"Mean_{space}_{channel}"] = float(stats[i])
                color_stats[f"Std_{space}_{channel}"] = float(stats[i + len(channels)])

            if space == "RGB":
                rgb_means = stats[:3]

        if rgb_means is not None:
            R, G, B = rgb_means
            color_stats.update({
                "Yellow": float((R + G - B) / 2),
                "Cyan": float((G + B - R) / 2),
                "Magenta": float(R + B),
                "Brightness": float((R + G + B) / 3),
                "Chroma": float(max(R, G, B) - min(R, G, B))
            })

        return color_stats
