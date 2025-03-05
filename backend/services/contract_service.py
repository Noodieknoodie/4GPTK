from typing import Dict, Any, Optional
from models.contracts import Contract, ExpectedFeeCalculation
from core.database import execute_query

def get_contract_by_id(contract_id: int) -> Optional[Contract]:
    query = """
        SELECT contract_id, client_id, contract_number, provider_name, 
               contract_start_date, fee_type, percent_rate, flat_rate,
               payment_schedule, num_people, notes
        FROM contracts
        WHERE contract_id = :contract_id AND valid_to IS NULL
    """
    
    contract_data = execute_query(query, {"contract_id": contract_id}, fetch_one=True)
    
    if not contract_data:
        return None
        
    return Contract(**contract_data)

def get_client_contract(client_id: int) -> Optional[Contract]:
    query = """
        SELECT contract_id, client_id, contract_number, provider_name, 
               contract_start_date, fee_type, percent_rate, flat_rate,
               payment_schedule, num_people, notes
        FROM contracts
        WHERE client_id = :client_id AND valid_to IS NULL
    """
    
    contract_data = execute_query(query, {"client_id": client_id}, fetch_one=True)
    
    if not contract_data:
        return None
        
    return Contract(**contract_data)

def calculate_expected_fee(contract_id: int, total_assets: Optional[float] = None) -> ExpectedFeeCalculation:
    contract = get_contract_by_id(contract_id)
    
    if not contract:
        return ExpectedFeeCalculation(
            expected_fee=None,
            fee_type="unknown",
            calculation_method="Contract not found"
        )
    
    if contract.fee_type == "flat":
        return ExpectedFeeCalculation(
            expected_fee=contract.flat_rate,
            fee_type="flat",
            calculation_method="Flat fee"
        )
    
    if contract.fee_type in ["percentage", "percent"]:
        if not total_assets:
            assets_query = """
                SELECT last_recorded_assets
                FROM client_metrics
                WHERE client_id = :client_id
            """
            
            metrics_data = execute_query(
                assets_query, 
                {"client_id": contract.client_id}, 
                fetch_one=True
            )
            
            if metrics_data and metrics_data.get("last_recorded_assets"):
                total_assets = metrics_data["last_recorded_assets"]
        
        if total_assets and contract.percent_rate:
            expected_fee = total_assets * contract.percent_rate
            rate_percentage = contract.percent_rate * 100
            
            return ExpectedFeeCalculation(
                expected_fee=expected_fee,
                fee_type="percentage",
                calculation_method=f"{rate_percentage:.4f}% of ${total_assets:,.2f}"
            )
    
    return ExpectedFeeCalculation(
        expected_fee=None,
        fee_type=contract.fee_type,
        calculation_method="Unable to calculate (missing data)"
    )