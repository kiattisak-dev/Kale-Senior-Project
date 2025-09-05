from fastapi import APIRouter, File, UploadFile, Form
from src.application.services.predict_services import PredictService
from fastapi.responses import Response, StreamingResponse

router = APIRouter()

@router.post("/predict/")
async def predict(
    file: UploadFile = File(...), 
):
    """
    API to accept an image and temperature, then predict output using extracted features.
    """
    try:
        # Read image bytes
        image = await file.read()
        prediction = PredictService.predict_image(image,)
        
        return {
            "status": "success",
            "data": prediction
        }


    except ValueError as e:
        return {"status": "error", "message": str(e)}

    except Exception as e:
        return {"status": "error", "message": f"Unexpected error: {e}"}
