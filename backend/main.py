from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from app.db.database import engine
from app.models import models
from app.routes import expenses
from app.routes import auth
from app.ocr_engine import extract_receipt_data
import shutil

models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Expense Fraud Detector API",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(expenses.router)
app.include_router(auth.router)


@app.get("/")
def root():
    return {
        "message": "Expense Fraud Detector API is running!"
    }


@app.post("/upload-receipt/")
async def upload_receipt(file: UploadFile = File(...)):
    file_path = f"temp_{file.filename}"

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    data = extract_receipt_data(file_path)

    return data