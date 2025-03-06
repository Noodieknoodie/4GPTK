import pytest
from tests.utils.date_utils import get_next_payment_date

def test_next_payment_date_monthly(setup_test_data):
    """Test next payment due date calculation for monthly client."""
    # Arrange
    last_payment_date = "2024-02-15"
    
    # Act
    next_date = get_next_payment_date(last_payment_date, "monthly")
    
    # Assert
    assert next_date == "2024-03-15"

def test_next_payment_date_quarterly(setup_test_data):
    """Test next payment due date calculation for quarterly client."""
    # Arrange
    last_payment_date = "2024-02-15"
    
    # Act
    next_date = get_next_payment_date(last_payment_date, "quarterly")
    
    # Assert
    assert next_date == "2024-05-15"

def test_next_payment_date_month_end(setup_test_data):
    """Test next payment date with month end edge case."""
    # Arrange
    last_payment_date = "2024-01-31"
    
    # Act
    next_date = get_next_payment_date(last_payment_date, "monthly")
    
    # Assert - Should handle February correctly
    assert next_date == "2024-02-29"  # 2024 is leap year

def test_next_payment_date_year_boundary(setup_test_data):
    """Test next payment date crossing year boundary."""
    # Arrange
    last_payment_date = "2024-11-15"
    
    # Act
    next_date = get_next_payment_date(last_payment_date, "quarterly")
    
    # Assert
    assert next_date == "2025-02-15"