# tests/utils/date_utils.py
from datetime import datetime

def format_date(date_string):
    """Format a date string to human-readable format."""
    if not date_string:
        return "N/A"
    try:
        date = datetime.strptime(date_string, "%Y-%m-%d")
        return date.strftime("%b %d, %Y")
    except ValueError:
        return date_string

def get_next_payment_date(last_payment_date, schedule):
    """
    Calculate the next payment date based on the last payment date and schedule.
    This is a Python implementation of the frontend's getNextPaymentDate.
    
    Parameters:
    last_payment_date (str): Last payment date in ISO format (YYYY-MM-DD)
    schedule (str): Payment schedule, either 'monthly' or 'quarterly'
    
    Returns:
    str: Next payment date in ISO format (YYYY-MM-DD)
    """
    if not last_payment_date:
        return None
    
    try:
        date = datetime.strptime(last_payment_date, "%Y-%m-%d")
        months_to_add = 1 if schedule.lower() == "monthly" else 3
        
        # Add the appropriate number of months
        year = date.year + ((date.month - 1 + months_to_add) // 12)
        month = (date.month - 1 + months_to_add) % 12 + 1
        
        # Handle month-end edge cases
        if date.day > 28:
            if month == 2:
                # February - check for leap year
                is_leap = (year % 4 == 0 and year % 100 != 0) or (year % 400 == 0)
                day = 29 if is_leap else 28
            elif month in [4, 6, 9, 11]:  # 30-day months
                day = min(date.day, 30)
            else:  # 31-day months
                day = date.day
        else:
            day = date.day
        
        next_date = datetime(year, month, day)
        return next_date.strftime("%Y-%m-%d")
    except ValueError:
        return None