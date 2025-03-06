from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta

from core.database import execute_query
from models.clients import Client, ClientBase, ClientMetrics, ClientSummary

def get_all_clients(provider: Optional[str] = None) -> List[Client]:
    query = """
        SELECT c.client_id, c.display_name, c.full_name, c.ima_signed_date, c.onedrive_folder_path,
               co.provider_name, cm.last_payment_date, cm.last_payment_amount
        FROM clients c
        LEFT JOIN (
            SELECT client_id, provider_name
            FROM contracts 
            WHERE valid_to IS NULL
            GROUP BY client_id
        ) co ON c.client_id = co.client_id
        LEFT JOIN client_metrics cm ON c.client_id = cm.client_id
        WHERE c.valid_to IS NULL
    """
    params = {}
    
    if provider:
        query += " AND co.provider_name = :provider"
        params["provider"] = provider
        
    query += " ORDER BY c.display_name"
    
    clients_data = execute_query(query, params)
    
    clients = []
    for client_data in clients_data:
        client = Client(**client_data)
        client.compliance_status = calculate_compliance_status(client_data)
        clients.append(client)
        
    return clients

def get_client_by_id(client_id: int) -> Optional[Client]:
    query = """
        SELECT c.client_id, c.display_name, c.full_name, c.ima_signed_date, c.onedrive_folder_path,
               co.provider_name, co.payment_schedule, co.fee_type, 
               cm.last_payment_date, cm.last_payment_amount, cm.last_payment_quarter, 
               cm.last_payment_year, cm.last_recorded_assets
        FROM clients c
        LEFT JOIN contracts co ON c.client_id = co.client_id AND co.valid_to IS NULL
        LEFT JOIN client_metrics cm ON c.client_id = cm.client_id
        WHERE c.client_id = :client_id AND c.valid_to IS NULL
    """
    
    client_data = execute_query(query, {"client_id": client_id}, fetch_one=True)
    
    if not client_data:
        return None
        
    client = Client(**client_data)
    client.compliance_status, client.compliance_reason = calculate_compliance_status(client_data, with_reason=True)
    
    return client

def get_client_summary(client_id: int) -> Optional[ClientSummary]:
    client_query = """
        SELECT client_id, display_name, full_name, ima_signed_date, onedrive_folder_path
        FROM clients
        WHERE client_id = :client_id AND valid_to IS NULL
    """
    client_data = execute_query(client_query, {"client_id": client_id}, fetch_one=True)
    
    if not client_data:
        return None
        
    metrics_query = """
        SELECT last_payment_date, last_payment_amount, last_payment_quarter, 
               last_payment_year, total_ytd_payments, avg_quarterly_payment, last_recorded_assets
        FROM client_metrics
        WHERE client_id = :client_id
    """
    metrics_data = execute_query(metrics_query, {"client_id": client_id}, fetch_one=True)
    
    contract_query = """
        SELECT contract_id, provider_name, contract_number, contract_start_date,
               fee_type, percent_rate, flat_rate, payment_schedule, num_people, notes
        FROM contracts
        WHERE client_id = :client_id AND valid_to IS NULL
    """
    contract_data = execute_query(contract_query, {"client_id": client_id}, fetch_one=True)
    
    quarterly_query = """
        SELECT year, quarter, total_payments, total_assets, payment_count, avg_payment, expected_total
        FROM quarterly_summaries
        WHERE client_id = :client_id
        ORDER BY year DESC, quarter DESC
        LIMIT 8
    """
    quarterly_data = execute_query(quarterly_query, {"client_id": client_id})
    
    yearly_query = """
        SELECT year, total_payments, total_assets, payment_count, avg_payment, yoy_growth
        FROM yearly_summaries
        WHERE client_id = :client_id
        ORDER BY year DESC
        LIMIT 5
    """
    yearly_data = execute_query(yearly_query, {"client_id": client_id})
    
    summary = ClientSummary(
        client=ClientBase(**client_data),
        metrics=ClientMetrics(**metrics_data) if metrics_data else None,
        contract=contract_data,
        quarterly_summaries=quarterly_data,
        yearly_summaries=yearly_data
    )
    
    return summary

def calculate_compliance_status(client_data: Dict[str, Any], with_reason: bool = False) -> str:
    if not client_data.get("last_payment_date"):
        reason = "No payment records found"
        return ("red", reason) if with_reason else "red"
    
    last_payment = datetime.strptime(client_data["last_payment_date"], "%Y-%m-%d")
    today = datetime.now()
    days_since_payment = (today - last_payment).days
    
    payment_schedule = client_data.get("payment_schedule", "").lower()
    
    if payment_schedule == "monthly":
        if days_since_payment <= 45:
            status = "green"
            reason = "Recent payment within acceptable timeframe"
        elif days_since_payment <= 75:
            status = "yellow"
            reason = "Payment approaching due date"
        else:
            status = "red"
            reason = "Payment overdue"
    else:  # Quarterly or unspecified defaults to quarterly
        if days_since_payment <= 135:
            status = "green"
            reason = "Recent payment within acceptable timeframe"
        elif days_since_payment <= 195:
            status = "yellow"
            reason = "Payment approaching due date"
        else:
            status = "red"
            reason = "Payment overdue"
    
    return (status, reason) if with_reason else status