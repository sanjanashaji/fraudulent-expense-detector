from sqlalchemy import Column, Integer, String, Float, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from zoneinfo import ZoneInfo
from app.db.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True)
    username = Column(String, unique=True, nullable=False)
    password = Column(String, nullable=False)
    role = Column(String, default="employee")

    expenses = relationship("Expense", back_populates="owner")


class Expense(Base):
    __tablename__ = "expenses"

    id = Column(Integer, primary_key=True)

    user_id = Column(Integer, ForeignKey("users.id"))
    username = Column(String)

    title = Column(String, nullable=False)
    amount = Column(Float, nullable=False)
    category = Column(String)
    description = Column(Text)
    receipt_filename = Column(String)

    submitted_by = Column(String)

    submitted_at = Column(
        DateTime,
        default=lambda: datetime.now(ZoneInfo("Asia/Kolkata"))
    )

    status = Column(String, default="pending")
    status_history = Column(Text, default="")
    fraud_score = Column(Float, default=0.0)
    risk_level = Column(String, default="unknown")
    ai_explanation = Column(Text)
    policy_violations = Column(Text)

    owner = relationship("User", back_populates="expenses")


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True)
    expense_id = Column(Integer, ForeignKey("expenses.id"))
    action = Column(String)
    performed_by = Column(String)
    details = Column(Text)

    timestamp = Column(
        DateTime,
        default=lambda: datetime.now(ZoneInfo("Asia/Kolkata"))
    )