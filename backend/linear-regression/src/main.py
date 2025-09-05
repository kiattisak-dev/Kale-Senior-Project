from fastapi import FastAPI
from src.interfaces.http.predict_controller import router as predict_router
import uvicorn
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Image Feature Extraction & Prediction API")

# Include API routes
app.include_router(predict_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000","http://localhost:8081"], 
    allow_credentials=True,
    allow_methods=["*"],  
    allow_headers=["*"], 
)

if __name__ == "__main__":
    print("Starting FastAPI on port 8083...")
    uvicorn.run(app, host="0.0.0.0", port=8083)
