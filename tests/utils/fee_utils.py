# tests/utils/fee_utils.py
def format_currency(value):
    """Format a numerical value as currency."""
    if value is None:
        return "N/A"
    return f"${value:,.2f}"

def generate_fee_references(contract):
    """
    Generate fee references for different time periods based on the contract.
    This is a Python implementation of the frontend's generateFeeReferences.
    
    Parameters:
    contract (dict): Contract details including fee_type, flat_rate, percent_rate, and payment_schedule
    
    Returns:
    dict: Monthly, quarterly, and annual fee references
    """
    if not contract:
        return None
    
    monthly_rate, quarterly_rate, annual_rate = None, None, None
    
    if contract.get("fee_type") == "flat":
        if contract.get("payment_schedule") == "monthly":
            monthly_rate = contract.get("flat_rate")
            quarterly_rate = monthly_rate * 3 if monthly_rate else None
            annual_rate = monthly_rate * 12 if monthly_rate else None
        else:  # quarterly
            quarterly_rate = contract.get("flat_rate")
            monthly_rate = quarterly_rate / 3 if quarterly_rate else None
            annual_rate = quarterly_rate * 4 if quarterly_rate else None
    elif contract.get("percent_rate"):
        if contract.get("payment_schedule") == "monthly":
            monthly_rate = contract.get("percent_rate")
            quarterly_rate = monthly_rate * 3 if monthly_rate else None
            annual_rate = monthly_rate * 12 if monthly_rate else None
        else:  # quarterly
            quarterly_rate = contract.get("percent_rate")
            monthly_rate = quarterly_rate / 3 if quarterly_rate else None
            annual_rate = quarterly_rate * 4 if quarterly_rate else None
    else:
        return None
    
    return {
        "monthly": format_currency(monthly_rate) if contract.get("fee_type") == "flat" else f"{monthly_rate * 100:.4f}%" if monthly_rate else None,
        "quarterly": format_currency(quarterly_rate) if contract.get("fee_type") == "flat" else f"{quarterly_rate * 100:.4f}%" if quarterly_rate else None,
        "annual": format_currency(annual_rate) if contract.get("fee_type") == "flat" else f"{annual_rate * 100:.4f}%" if annual_rate else None,
    }