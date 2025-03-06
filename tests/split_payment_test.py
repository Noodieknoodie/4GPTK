import pytest
from backend.services.payment_service import (
    create_payment, get_payment_by_id, enhance_payment_with_details, calculate_periods
)
from backend.models.payments import PaymentCreate

def test_create_monthly_split_payment(setup_test_data, mock_execute_query):
    """Test creating a split payment covering multiple months."""
    # Arrange
    payment_data = PaymentCreate(
        contract_id=3,
        client_id=3,
        received_date="2024-04-15",
        total_assets=1500000.0,
        expected_fee=3750.0,
        actual_fee=3750.0,
        method="wire",
        notes="Split payment test",
        applied_start_month=4,
        applied_start_month_year=2024,
        applied_end_month=6,
        applied_end_month_year=2024
    )
    
    # Act
    new_payment = create_payment(payment_data)
    enhanced_payment = enhance_payment_with_details(get_payment_by_id(new_payment.payment_id))
    
    # Assert
    assert enhanced_payment.is_split_payment == True
    assert len(enhanced_payment.periods) == 3
    assert enhanced_payment.periods[0]["amount"] == pytest.approx(1250.0, 0.01)

def test_calculate_periods_monthly(setup_test_data):
    """Test period calculation for monthly split payments."""
    # Arrange
    payment = {
        "applied_start_month": 1,
        "applied_start_month_year": 2024,
        "applied_end_month": 3,
        "applied_end_month_year": 2024,
        "applied_start_quarter": None,
        "applied_start_quarter_year": None,
        "applied_end_quarter": None,
        "applied_end_quarter_year": None,
        "actual_fee": 3000.0
    }
    payment = type('PaymentWithDetails', (), payment)
    
    # Act
    periods = calculate_periods(payment)
    
    # Assert
    assert len(periods) == 3
    assert periods[0]["period"] == "January 2024"
    assert periods[1]["period"] == "February 2024"
    assert periods[2]["period"] == "March 2024"
    assert periods[0]["amount"] == 1000.0

def test_calculate_periods_quarterly(setup_test_data):
    """Test period calculation for quarterly split payments."""
    # Arrange
    payment = {
        "applied_start_month": None,
        "applied_start_month_year": None,
        "applied_end_month": None,
        "applied_end_month_year": None,
        "applied_start_quarter": 1,
        "applied_start_quarter_year": 2024,
        "applied_end_quarter": 2,
        "applied_end_quarter_year": 2024,
        "actual_fee": 7500.0
    }
    payment = type('PaymentWithDetails', (), payment)
    
    # Act
    periods = calculate_periods(payment)
    
    # Assert
    assert len(periods) == 2
    assert periods[0]["period"] == "Q1 2024"
    assert periods[1]["period"] == "Q2 2024"
    assert periods[0]["amount"] == 3750.0

def test_split_payment_year_boundary(setup_test_data, mock_execute_query):
    """Test split payment calculation across year boundary."""
    # Arrange
    payment_data = PaymentCreate(
        contract_id=3,
        client_id=3,
        received_date="2024-11-15",
        total_assets=1500000.0,
        expected_fee=3750.0,
        actual_fee=3750.0,
        method="wire",
        notes="Year boundary test",
        applied_start_month=11,
        applied_start_month_year=2024,
        applied_end_month=1,
        applied_end_month_year=2025
    )
    
    # Act
    new_payment = create_payment(payment_data)
    enhanced_payment = enhance_payment_with_details(get_payment_by_id(new_payment.payment_id))
    
    # Assert
    assert enhanced_payment.is_split_payment == True
    assert len(enhanced_payment.periods) == 3
    assert enhanced_payment.periods[0]["period"] == "November 2024"
    assert enhanced_payment.periods[2]["period"] == "January 2025"

def test_is_split_payment_detection(setup_test_data, mock_execute_query):
    """Test detection of split vs. single period payments."""
    # Arrange & Act - Single period
    single_payment = enhance_payment_with_details({
        "payment_id": 1,
        "contract_id": 1,
        "client_id": 1,
        "received_date": "2024-01-15",
        "applied_start_month": 1,
        "applied_start_month_year": 2024,
        "applied_end_month": 1,
        "applied_end_month_year": 2024,
        "actual_fee": 40.0
    })
    
    # Split period
    split_payment = enhance_payment_with_details({
        "payment_id": 3,
        "contract_id": 3,
        "client_id": 3,
        "received_date": "2024-01-10",
        "applied_start_month": 1,
        "applied_start_month_year": 2024,
        "applied_end_month": 3,
        "applied_end_month_year": 2024,
        "actual_fee": 5000.0
    })
    
    # Assert
    assert single_payment.is_split_payment == False
    assert split_payment.is_split_payment == True
    assert len(split_payment.periods) == 3