from pydantic import BaseModel
from typing import Optional, List, Dict, Any

class PaymentBase(BaseModel):
    contract_id: int
    client_id: int
    received_date: str
    actual_fee: float

class PaymentCreate(PaymentBase):
    total_assets: Optional[float] = None
    expected_fee: Optional[float] = None
    method: Optional[str] = None
    notes: Optional[str] = None
    applied_start_month: Optional[int] = None
    applied_start_month_year: Optional[int] = None
    applied_end_month: Optional[int] = None
    applied_end_month_year: Optional[int] = None
    applied_start_quarter: Optional[int] = None
    applied_start_quarter_year: Optional[int] = None
    applied_end_quarter: Optional[int] = None
    applied_end_quarter_year: Optional[int] = None

class Payment(PaymentBase):
    payment_id: int
    total_assets: Optional[float] = None
    expected_fee: Optional[float] = None
    method: Optional[str] = None
    notes: Optional[str] = None
    applied_start_month: Optional[int] = None
    applied_start_month_year: Optional[int] = None
    applied_end_month: Optional[int] = None
    applied_end_month_year: Optional[int] = None
    applied_start_quarter: Optional[int] = None
    applied_start_quarter_year: Optional[int] = None
    applied_end_quarter: Optional[int] = None
    applied_end_quarter_year: Optional[int] = None
    client_name: Optional[str] = None
    provider_name: Optional[str] = None

class PaymentWithDetails(Payment):
    is_split_payment: bool = False
    periods: Optional[List[Dict[str, Any]]] = None
    variance: Optional[Dict[str, Any]] = None

class AvailablePeriods(BaseModel):
    periods: List[Dict[str, Any]]