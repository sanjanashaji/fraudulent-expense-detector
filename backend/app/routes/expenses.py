from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.models import Expense
from app.services.fraud_engine import get_fraud_score
import json

router = APIRouter(prefix="/expenses", tags=["expenses"])


@router.post("/")
def create_expense(
    title: str = Form(...),
    amount: float = Form(...),
    category: str = Form(...),
    description: str = Form(...),
    user_id: int = Form(1),
    username: str = Form(...),
    receipt: UploadFile = File(None),
    db: Session = Depends(get_db)
):
    try:
        receipt_name = None

        if receipt:
            receipt_name = receipt.filename

        # Exact duplicate check
        existing_claim = db.query(Expense).filter(
            Expense.submitted_by == username,
            Expense.title == title,
            Expense.amount == amount,
            Expense.category == category
        ).first()

        if existing_claim:
            raise HTTPException(
                status_code=400,
                detail="Duplicate claim already submitted"
            )

        # Create expense
        db_expense = Expense(
            title=title,
            amount=amount,
            category=category,
            description=description,
            receipt_filename=receipt_name,
            username=username,
            submitted_by=username
        )

        db.add(db_expense)
        db.commit()
        db.refresh(db_expense)

        # Fraud analysis
        result = get_fraud_score({
            "id": str(db_expense.id),
            "title": title,
            "amount": amount,
            "category": category,
            "description": description,
            "submitted_by": username
        })

        db_expense.fraud_score = result["fraud_score"]
        db_expense.risk_level = result["risk_level"]
        db_expense.ai_explanation = result["explanation"]
        db_expense.policy_violations = json.dumps(result["flags"])

        db.commit()
        db.refresh(db_expense)

        return {
            "id": db_expense.id,
            "title": db_expense.title,
            "amount": db_expense.amount,
            "category": db_expense.category,
            "status": db_expense.status,
            "fraud_score": db_expense.fraud_score,
            "risk_level": db_expense.risk_level,
            "ai_explanation": db_expense.ai_explanation,
            "policy_violations": db_expense.policy_violations,
            "submitted_at": db_expense.submitted_at,
            "submitted_by": db_expense.submitted_by,
            "username": db_expense.username,
        }

    except HTTPException as e:
        raise e

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/")
def list_expenses(db: Session = Depends(get_db)):
    expenses = db.query(Expense).order_by(Expense.id.desc()).all()

    return [{
        "id": e.id,
        "title": e.title,
        "amount": e.amount,
        "category": e.category,
        "status": e.status,
        "fraud_score": e.fraud_score,
        "risk_level": e.risk_level,
        "ai_explanation": e.ai_explanation,
        "policy_violations": e.policy_violations,
        "submitted_at": e.submitted_at,
        "status_history": e.status_history,
        "submitted_by": e.submitted_by,
    } for e in expenses]


@router.patch("/{expense_id}/status")
def update_status(expense_id: int, status: str, db: Session = Depends(get_db)):
    from datetime import datetime

    exp = db.query(Expense).filter(Expense.id == expense_id).first()

    if not exp:
        raise HTTPException(status_code=404, detail="Not found")

    exp.status = status
    exp.status_history = f"{status.capitalize()} by Admin at {datetime.now().strftime('%I:%M %p')}"

    db.commit()

    return {
        "id": exp.id,
        "status": exp.status,
        "status_history": exp.status_history
    }