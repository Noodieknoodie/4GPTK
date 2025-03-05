from pydantic import BaseModel
from typing import Optional

class ContractBase(BaseModel):
    contract_id: int
    client_id: int
    provider_name: str
    fee_type: str
    payment_schedule: str

class Contract(ContractBase):
    contract_number: Optional[str] = None
    contract_start_date: Optional[str] = None
    percent_rate: Optional[float] = None
    flat_rate: Optional[float] = None
    num_people: Optional[int] = None
    notes: Optional[str] = None

class ExpectedFeeCalculation(BaseModel):
    expected_fee: Optional[float] = None
    fee_type: str
    calculation_method: str