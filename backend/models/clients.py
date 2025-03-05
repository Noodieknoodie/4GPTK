from pydantic import BaseModel
from typing import Optional, List, Dict, Any

class ClientBase(BaseModel):
    client_id: int
    display_name: str
    full_name: str
    ima_signed_date: Optional[str] = None
    onedrive_folder_path: Optional[str] = None

class Client(ClientBase):
    compliance_status: Optional[str] = None
    compliance_reason: Optional[str] = None
    last_payment_date: Optional[str] = None
    last_payment_amount: Optional[float] = None
    provider_name: Optional[str] = None

class ClientMetrics(BaseModel):
    last_payment_date: Optional[str] = None
    last_payment_amount: Optional[float] = None
    last_payment_quarter: Optional[int] = None
    last_payment_year: Optional[int] = None
    total_ytd_payments: Optional[float] = None
    avg_quarterly_payment: Optional[float] = None
    last_recorded_assets: Optional[float] = None
    
class ClientSummary(BaseModel):
    client: ClientBase
    metrics: Optional[ClientMetrics] = None
    contract: Optional[Dict[str, Any]] = None
    quarterly_summaries: Optional[List[Dict[str, Any]]] = None
    yearly_summaries: Optional[List[Dict[str, Any]]] = None