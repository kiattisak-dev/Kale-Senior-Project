import uvicorn
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware 
from src.adapters.api import segment_router, version_router
from src.infrastructure.model_loader import ModelLoader

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Instantiate FastAPI Application
app = FastAPI(
    title="Background Segmentation API",
    version="0.0.2",
    description="Remove background from images using DeepLabV3+ model"
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  
    allow_credentials=True,
    allow_methods=["*"],  
    allow_headers=["*"],  
)

# Instantiate ModelLoader
model_loader = ModelLoader()

# Register API Routers
app.include_router(segment_router, prefix="/segment", tags=["Segmentation"])
app.include_router(version_router, prefix="/version", tags=["Version"])

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8082)
