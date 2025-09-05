from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import StreamingResponse
import logging
import io
import numpy as np
import cv2
from src.application import SegmentationService
from src.infrastructure import model_loader

# Setup logging
logger = logging.getLogger(__name__)

# Create FastAPI Routers
segment_router = APIRouter()
version_router = APIRouter()

@segment_router.post("/")
async def segment_image(file: UploadFile = File(...)):
    try:
        # Read image
        image_bytes = await file.read()
        image_np = np.frombuffer(image_bytes, np.uint8)
        image = cv2.imdecode(image_np, cv2.IMREAD_COLOR)

        if image is None:
            raise ValueError("Invalid image format")

        image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)  # Convert to RGB
        mask = SegmentationService.segment_image(image, model_loader)
        segmented_image = SegmentationService.remove_background(image, mask)

        # Convert image to PNG bytes
        _, img_encoded = cv2.imencode(".png", segmented_image)
        img_bytes = io.BytesIO(img_encoded.tobytes())

        logger.info(f"✅ Segmentation successful for {file.filename}")
        return StreamingResponse(img_bytes, media_type="image/png")

    except Exception as e:
        logger.error(f"❌ Segmentation failed: {e}")
        raise HTTPException(status_code=500, detail=f"Segmentation failed: {e}")

@version_router.get("/")
def get_version():
    return {"version": "0.0.1"}
