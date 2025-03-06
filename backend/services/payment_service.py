from typing import List, Dict, Any, Optional
from datetime import datetime

from core.database import execute_query
from models.payments import Payment, PaymentCreate, PaymentWithDetails, AvailablePeriods
from services.contract_service import get_contract_by_id

def get_client_payments(
    client_id: int,
    page: int = 1,
    limit: int = 10,
    year: Optional[int] = None
) -> List[PaymentWithDetails]:
    offset = (page - 1) * limit
    
    params = {"client_id": client_id, "limit": limit, "offset": offset}
    
    query = """
        SELECT 
            p.payment_id, p.contract_id, p.client_id, p.received_date, 
            p.total_assets, p.expected_fee, p.actual_fee, p.method, p.notes,
            p.applied_start_month, p.applied_start_month_year, 
            p.applied_end_month, p.applied_end_month_year,
            p.applied_start_quarter, p.applied_start_quarter_year, 
            p.applied_end_quarter, p.applied_end_quarter_year,
            c.display_name as client_name, co.provider_name, co.fee_type, 
            co.percent_rate, co.flat_rate, co.payment_schedule
        FROM payments p
        JOIN clients c ON p.client_id = c.client_id
        LEFT JOIN contracts co ON p.contract_id = co.contract_id
        WHERE p.client_id = :client_id AND p.valid_to IS NULL
    """
    
    if year:
        query += """ 
            AND (
                (p.applied_start_month_year = :year) OR 
                (p.applied_end_month_year = :year) OR
                (p.applied_start_quarter_year = :year) OR 
                (p.applied_end_quarter_year = :year)
            )
        """
        params["year"] = year
    
    query += " ORDER BY p.received_date DESC LIMIT :limit OFFSET :offset"
    
    payment_data = execute_query(query, params)
    
    enhanced_payments = []
    for payment in payment_data:
        payment_with_details = enhance_payment_with_details(payment)
        enhanced_payments.append(payment_with_details)
    
    return enhanced_payments

def get_payment_by_id(payment_id: int) -> Optional[PaymentWithDetails]:
    query = """
        SELECT 
            p.payment_id, p.contract_id, p.client_id, p.received_date, 
            p.total_assets, p.expected_fee, p.actual_fee, p.method, p.notes,
            p.applied_start_month, p.applied_start_month_year, 
            p.applied_end_month, p.applied_end_month_year,
            p.applied_start_quarter, p.applied_start_quarter_year, 
            p.applied_end_quarter, p.applied_end_quarter_year,
            c.display_name as client_name, co.provider_name, co.fee_type, 
            co.percent_rate, co.flat_rate, co.payment_schedule
        FROM payments p
        JOIN clients c ON p.client_id = c.client_id
        LEFT JOIN contracts co ON p.contract_id = co.contract_id
        WHERE p.payment_id = :payment_id AND p.valid_to IS NULL
    """
    
    payment_data = execute_query(query, {"payment_id": payment_id}, fetch_one=True)
    
    if not payment_data:
        return None
        
    return enhance_payment_with_details(payment_data)

def create_payment(payment: PaymentCreate) -> Payment:
    contract = get_contract_by_id(payment.contract_id)
    
    is_monthly = contract.payment_schedule.lower() == "monthly"
    
    query = """
        INSERT INTO payments (
            contract_id, client_id, received_date, total_assets,
            expected_fee, actual_fee, method, notes
    """
    
    if is_monthly:
        query += """,
            applied_start_month, applied_start_month_year,
            applied_end_month, applied_end_month_year
        """
    else:
        query += """,
            applied_start_quarter, applied_start_quarter_year,
            applied_end_quarter, applied_end_quarter_year
        """
    
    query += ") VALUES ("
    query += ":contract_id, :client_id, :received_date, :total_assets, "
    query += ":expected_fee, :actual_fee, :method, :notes"
    
    if is_monthly:
        query += """,
            :applied_start_month, :applied_start_month_year,
            :applied_end_month, :applied_end_month_year
        """
    else:
        query += """,
            :applied_start_quarter, :applied_start_quarter_year,
            :applied_end_quarter, :applied_end_quarter_year
        """
    
    query += ")"
    
    params = payment.dict(exclude_unset=True)
    
    result = execute_query(query, params)
    
    update_client_metrics(payment.client_id)
    
    created_payment = get_payment_by_id(result["lastrowid"])
    
    return Payment(**created_payment.dict())

def update_payment(payment_id: int, payment: PaymentCreate) -> Optional[Payment]:
    existing = get_payment_by_id(payment_id)
    if not existing:
        return None
    
    contract = get_contract_by_id(payment.contract_id)
    is_monthly = contract.payment_schedule.lower() == "monthly"
    
    query = """
        UPDATE payments
        SET contract_id = :contract_id,
            client_id = :client_id,
            received_date = :received_date,
            total_assets = :total_assets,
            expected_fee = :expected_fee,
            actual_fee = :actual_fee,
            method = :method,
            notes = :notes
    """
    
    if is_monthly:
        query += """,
            applied_start_month = :applied_start_month,
            applied_start_month_year = :applied_start_month_year,
            applied_end_month = :applied_end_month,
            applied_end_month_year = :applied_end_month_year,
            applied_start_quarter = NULL,
            applied_start_quarter_year = NULL,
            applied_end_quarter = NULL,
            applied_end_quarter_year = NULL
        """
    else:
        query += """,
            applied_start_month = NULL,
            applied_start_month_year = NULL,
            applied_end_month = NULL,
            applied_end_month_year = NULL,
            applied_start_quarter = :applied_start_quarter,
            applied_start_quarter_year = :applied_start_quarter_year,
            applied_end_quarter = :applied_end_quarter,
            applied_end_quarter_year = :applied_end_quarter_year
        """
    
    query += " WHERE payment_id = :payment_id"
    
    params = payment.dict(exclude_unset=True)
    params["payment_id"] = payment_id
    
    execute_query(query, params)
    
    update_client_metrics(payment.client_id)
    
    updated_payment = get_payment_by_id(payment_id)
    
    return Payment(**updated_payment.dict())

def delete_payment(payment_id: int) -> bool:
    payment = get_payment_by_id(payment_id)
    if not payment:
        return False
    
    query = """
        UPDATE payments
        SET valid_to = CURRENT_TIMESTAMP
        WHERE payment_id = :payment_id
    """
    
    result = execute_query(query, {"payment_id": payment_id})
    
    update_client_metrics(payment.client_id)
    
    return result["rowcount"] > 0

def update_client_metrics(client_id: int) -> None:
    latest_payment_query = """
        SELECT 
            received_date, actual_fee, 
            CASE 
                WHEN applied_start_quarter IS NOT NULL THEN applied_start_quarter
                ELSE (CAST((applied_start_month - 1) / 3 AS INT) + 1)
            END as quarter,
            CASE 
                WHEN applied_start_quarter_year IS NOT NULL THEN applied_start_quarter_year
                ELSE applied_start_month_year
            END as year,
            total_assets
        FROM payments
        WHERE client_id = :client_id AND valid_to IS NULL
        ORDER BY received_date DESC
        LIMIT 1
    """
    
    latest_payment = execute_query(
        latest_payment_query, 
        {"client_id": client_id}, 
        fetch_one=True
    )
    
    if not latest_payment:
        return
    
    current_year = datetime.now().year
    ytd_query = """
        SELECT SUM(actual_fee) as total
        FROM payments
        WHERE client_id = :client_id 
        AND valid_to IS NULL
        AND (
            (applied_start_quarter_year = :year) OR 
            (applied_start_month_year = :year)
        )
    """
    
    ytd_result = execute_query(
        ytd_query, 
        {"client_id": client_id, "year": current_year}, 
        fetch_one=True
    )
    
    avg_query = """
        SELECT AVG(total_payments) as average
        FROM quarterly_summaries
        WHERE client_id = :client_id
        ORDER BY year DESC, quarter DESC
        LIMIT 8
    """
    
    avg_result = execute_query(
        avg_query, 
        {"client_id": client_id}, 
        fetch_one=True
    )
    
    upsert_query = """
        INSERT INTO client_metrics (
            client_id, last_payment_date, last_payment_amount, 
            last_payment_quarter, last_payment_year, 
            total_ytd_payments, avg_quarterly_payment, 
            last_recorded_assets, last_updated
        ) VALUES (
            :client_id, :last_payment_date, :last_payment_amount,
            :last_payment_quarter, :last_payment_year,
            :total_ytd_payments, :avg_quarterly_payment,
            :last_recorded_assets, CURRENT_TIMESTAMP
        )
        ON CONFLICT(client_id) DO UPDATE SET
            last_payment_date = :last_payment_date,
            last_payment_amount = :last_payment_amount,
            last_payment_quarter = :last_payment_quarter,
            last_payment_year = :last_payment_year,
            total_ytd_payments = :total_ytd_payments,
            avg_quarterly_payment = :avg_quarterly_payment,
            last_recorded_assets = :last_recorded_assets,
            last_updated = CURRENT_TIMESTAMP
    """
    
    params = {
        "client_id": client_id,
        "last_payment_date": latest_payment.get("received_date"),
        "last_payment_amount": latest_payment.get("actual_fee"),
        "last_payment_quarter": latest_payment.get("quarter"),
        "last_payment_year": latest_payment.get("year"),
        "total_ytd_payments": ytd_result.get("total") if ytd_result else None,
        "avg_quarterly_payment": avg_result.get("average") if avg_result else None,
        "last_recorded_assets": latest_payment.get("total_assets"),
    }
    
    execute_query(upsert_query, params)

def enhance_payment_with_details(payment_data: Dict[str, Any]) -> PaymentWithDetails:
    payment = PaymentWithDetails(**payment_data)
    
    is_split_monthly = (
        payment.applied_start_month is not None and
        payment.applied_end_month is not None and
        (
            payment.applied_start_month != payment.applied_end_month or
            payment.applied_start_month_year != payment.applied_end_month_year
        )
    )
    
    is_split_quarterly = (
        payment.applied_start_quarter is not None and
        payment.applied_end_quarter is not None and
        (
            payment.applied_start_quarter != payment.applied_end_quarter or
            payment.applied_start_quarter_year != payment.applied_end_quarter_year
        )
    )
    
    payment.is_split_payment = is_split_monthly or is_split_quarterly
    
    if payment.is_split_payment:
        payment.periods = calculate_periods(payment)
    
    payment.variance = calculate_variance(payment)
    
    return payment

def calculate_periods(payment: PaymentWithDetails) -> List[Dict[str, Any]]:
    periods = []
    
    # Default actual_fee to 0 if it's None
    actual_fee = payment.actual_fee or 0
    
    if payment.applied_start_quarter is not None:
        start_quarter = payment.applied_start_quarter
        start_year = payment.applied_start_quarter_year
        end_quarter = payment.applied_end_quarter
        end_year = payment.applied_end_quarter_year
        
        total_periods = (end_year - start_year) * 4 + (end_quarter - start_quarter) + 1
        amount_per_period = actual_fee / total_periods if total_periods > 0 else 0
        
        for i in range(total_periods):
            current_quarter = ((start_quarter + i - 1) % 4) + 1
            current_year = start_year + ((start_quarter + i - 1) // 4)
            
            periods.append({
                "period": f"Q{current_quarter} {current_year}",
                "amount": amount_per_period
            })
    elif payment.applied_start_month is not None:
        start_month = payment.applied_start_month
        start_year = payment.applied_start_month_year
        end_month = payment.applied_end_month
        end_year = payment.applied_end_month_year
        
        total_periods = (end_year - start_year) * 12 + (end_month - start_month) + 1
        amount_per_period = actual_fee / total_periods if total_periods > 0 else 0
        
        for i in range(total_periods):
            current_month = ((start_month + i - 1) % 12) + 1
            current_year = start_year + ((start_month + i - 1) // 12)
            
            month_name = [
                "January", "February", "March", "April", "May", "June",
                "July", "August", "September", "October", "November", "December"
            ][current_month - 1]
            
            periods.append({
                "period": f"{month_name} {current_year}",
                "amount": amount_per_period
            })
    
    return periods

def calculate_variance(payment: PaymentWithDetails) -> Dict[str, Any]:
    effective_expected_fee = payment.expected_fee
    
    if (
        payment.expected_fee is None and 
        payment.total_assets is not None and 
        payment.fee_type == "percentage" and
        payment.percent_rate is not None
    ):
        effective_expected_fee = payment.total_assets * payment.percent_rate
    
    # If either expected fee or actual fee is missing, we can't calculate variance
    if effective_expected_fee is None or payment.actual_fee is None:
        return {
            "difference": None,
            "percent_difference": None,
            "status": "unknown",
            "message": "Cannot calculate"
        }
    
    difference = payment.actual_fee - effective_expected_fee
    percent_difference = (difference / effective_expected_fee) * 100 if effective_expected_fee != 0 else 0
    abs_percent_difference = abs(percent_difference)
    
    if payment.actual_fee == effective_expected_fee:
        status = "exact"
        message = "Exact Match"
    elif abs_percent_difference <= 5:
        status = "acceptable"
        message = f"${difference:.2f} ({percent_difference:.2f}%) ✓"
    elif abs_percent_difference <= 15:
        status = "warning"
        message = f"${difference:.2f} ({percent_difference:.2f}%)"
    else:
        status = "alert"
        message = f"${difference:.2f} ({percent_difference:.2f}%)"
    
    return {
        "difference": difference,
        "percent_difference": percent_difference,
        "status": status,
        "message": message
    }

def get_available_periods(contract_id: int, client_id: int) -> AvailablePeriods:
    # Get contract details
    contract_query = """
        SELECT contract_id, contract_start_date, payment_schedule
        FROM contracts
        WHERE contract_id = :contract_id 
        AND client_id = :client_id
        AND valid_to IS NULL
    """
    
    contract_data = execute_query(
        contract_query, 
        {"contract_id": contract_id, "client_id": client_id}, 
        fetch_one=True
    )
    
    if not contract_data:
        return AvailablePeriods(periods=[])
        
    contract_start = None
    if contract_data.get("contract_start_date"):
        try:
            contract_start = datetime.strptime(
                contract_data["contract_start_date"], 
                "%Y-%m-%d"
            )
        except ValueError:
            pass
    
    if not contract_start:
        contract_start = datetime(datetime.now().year, 1, 1)
    
    current_date = datetime.now()
    periods = []
    
    if contract_data["payment_schedule"].lower() == "monthly":
        for year in range(contract_start.year, current_date.year + 1):
            start_month = 1
            end_month = 12
            
            if year == contract_start.year:
                start_month = contract_start.month
            if year == current_date.year:
                end_month = current_date.month
            
            for month in range(start_month, end_month + 1):
                month_name = [
                    "January", "February", "March", "April", "May", "June",
                    "July", "August", "September", "October", "November", "December"
                ][month - 1]
                
                periods.append({
                    "label": f"{month_name} {year}",
                    "value": f"{month}-{year}"
                })
    else:
        for year in range(contract_start.year, current_date.year + 1):
            start_quarter = 1
            end_quarter = 4
            
            if year == contract_start.year:
                start_quarter = (contract_start.month - 1) // 3 + 1
            if year == current_date.year:
                end_quarter = (current_date.month - 1) // 3 + 1
            
            for quarter in range(start_quarter, end_quarter + 1):
                periods.append({
                    "label": f"Q{quarter} {year}",
                    "value": f"{quarter}-{year}"
                })
    
    return AvailablePeriods(periods=periods)