import pytest
from datetime import datetime, timedelta
from backend.services.client_service import calculate_compliance_status

def test_calculate_compliance_status_monthly_compliant(setup_test_data):
    """Test compliance status for recently paid monthly client."""
    # Arrange
    client_data = {
        "payment_schedule": "monthly",
        "last_payment_date": (datetime.now() - timedelta(days=30)).strftime("%Y-%m-%d")
    }
    
    # Act
    status, reason = calculate_compliance_status(client_data, with_reason=True)
    
    # Assert
    assert status == "green"
    assert "acceptable timeframe" in reason.lower()

def test_calculate_compliance_status_monthly_warning(setup_test_data):
    """Test compliance status for monthly client approaching due date."""
    # Arrange
    client_data = {
        "payment_schedule": "monthly",
        "last_payment_date": (datetime.now() - timedelta(days=60)).strftime("%Y-%m-%d")
    }
    
    # Act
    status, reason = calculate_compliance_status(client_data, with_reason=True)
    
    # Assert
    assert status == "yellow"
    assert "approaching" in reason.lower()

def test_calculate_compliance_status_monthly_overdue(setup_test_data):
    """Test compliance status for overdue monthly client."""
    # Arrange
    client_data = {
        "payment_schedule": "monthly",
        "last_payment_date": (datetime.now() - timedelta(days=90)).strftime("%Y-%m-%d")
    }
    
    # Act
    status, reason = calculate_compliance_status(client_data, with_reason=True)
    
    # Assert
    assert status == "red"
    assert "overdue" in reason.lower()

def test_calculate_compliance_status_quarterly_compliant(setup_test_data):
    """Test compliance status for recently paid quarterly client."""
    # Arrange
    client_data = {
        "payment_schedule": "quarterly",
        "last_payment_date": (datetime.now() - timedelta(days=60)).strftime("%Y-%m-%d")
    }
    
    # Act
    status, reason = calculate_compliance_status(client_data, with_reason=True)
    
    # Assert
    assert status == "green"
    assert "acceptable timeframe" in reason.lower()

def test_calculate_compliance_status_quarterly_warning(setup_test_data):
    """Test compliance status for quarterly client approaching due date."""
    # Arrange
    client_data = {
        "payment_schedule": "quarterly",
        "last_payment_date": (datetime.now() - timedelta(days=150)).strftime("%Y-%m-%d")
    }
    
    # Act
    status, reason = calculate_compliance_status(client_data, with_reason=True)
    
    # Assert
    assert status == "yellow"
    assert "approaching" in reason.lower()

def test_calculate_compliance_status_quarterly_overdue(setup_test_data):
    """Test compliance status for overdue quarterly client."""
    # Arrange
    client_data = {
        "payment_schedule": "quarterly",
        "last_payment_date": (datetime.now() - timedelta(days=200)).strftime("%Y-%m-%d")
    }
    
    # Act
    status, reason = calculate_compliance_status(client_data, with_reason=True)
    
    # Assert
    assert status == "red"
    assert "overdue" in reason.lower()

def test_calculate_compliance_status_no_payment(setup_test_data):
    """Test compliance status when no payment exists."""
    # Arrange
    client_data = {
        "payment_schedule": "monthly",
        "last_payment_date": None
    }
    
    # Act
    status, reason = calculate_compliance_status(client_data, with_reason=True)
    
    # Assert
    assert status == "red"
    assert "no payment" in reason.lower()

def test_calculate_compliance_status_split_payment(setup_test_data):
    """Test compliance for client with split payment."""
    # This test identifies the issue - compliance is calculated based on payment date
    # not the coverage end date
    
    # Arrange
    client_data = {
        "payment_schedule": "monthly",
        "last_payment_date": (datetime.now() - timedelta(days=90)).strftime("%Y-%m-%d"),
        # Add these to simulate what it would look like with proper check of coverage period
        "applied_end_month": datetime.now().month - 1,
        "applied_end_month_year": datetime.now().year
    }
    
    # Act
    status, reason = calculate_compliance_status(client_data, with_reason=True)
    
    # Assert
    assert status == "red"
    assert "overdue" in reason.lower()
    # This test demonstrates the bug - even though the payment covered a recent period,
    # the status is red because it only checks payment date