from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.models import User

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/signup")
def signup(data: dict, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.username == data["username"]).first()

    if existing:
        raise HTTPException(status_code=400, detail="Username already exists")

    user = User(
        username=data["username"],
        password=data["password"],
        role="employee"
    )

    db.add(user)
    db.commit()

    return {"message": "Signup successful"}


@router.post("/login")
def login(data: dict, db: Session = Depends(get_db)):
    user = db.query(User).filter(
        User.username == data["username"],
        User.password == data["password"]
    ).first()

    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    return {
        "username": user.username,
        "role": user.role
    }