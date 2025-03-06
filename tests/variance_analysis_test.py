import pytest
from backend.services.payment_service import calculate_variance

def test_variance_exact_match(setup_test_data):
    """Test variance calculation when expected equals actual fee."""
    # Arrange
    payment = {
        "expected_fee": 3750.0,
        "actual_fee": 3750.0,
        "fee_type": "flat",
        "percent_rate": None
    }
    
    # Act
    variance = calculate_variance(type('Payment', (), payment))
    
    # Assert
    assert variance["status"] == "exact"
    assert variance["message"] == "Exact Match"
    assert variance["difference"] == 0.0
    assert variance["percent_difference"] == 0.0

def test_variance_acceptable_range(setup_test_data):
    """Test variance within acceptable range (≤5%)."""
    # Arrange
    payment = {
        "expected_fee": 3750.0,
        "actual_fee": 3900.0,
        "fee_type": "flat",
        "percent_rate": None
    }
    
    # Act
    variance = calculate_variance(type('Payment', (), payment))
    
    # Assert
    assert variance["status"] == "acceptable"
    assert variance["difference"] == 150.0
    assert variance["percent_difference"] == 4.0
    assert "✓" in variance["message"]

def test_variance_warning_range(setup_test_data):
    """Test variance in warning range (5-15%)."""
    # Arrange
    payment = {
        "expected_fee": 3750.0,
        "actual_fee": 4125.0,
        "fee_type": "flat",
        "percent_rate": None
    }
    
    # Act
    variance = calculate_variance(type('Payment', (), payment))
    
    # Assert
    assert variance["status"] == "warning"
    assert variance["difference"] == 375.0
    assert variance["percent_difference"] == 10.0

def test_variance_alert_range(setup_test_data):
    """Test variance in alert range (>15%)."""
    # Arrange
    payment = {
        "expected_fee": 3750.0,
        "actual_fee": 4500.0,
        "fee_type": "flat",
        "percent_rate": None
    }
    
    # Act
    variance = calculate_variance(type('Payment', (), payment))
    
    # Assert
    assert variance["status"] == "alert"
    assert variance["difference"] == 750.0
    assert variance["percent_difference"] == 20.0

def test_variance_small_amount_high_percentage(setup_test_data):
    """Test small dollar amount with high percentage variance."""
    # Arrange
    payment = {
        "expected_fee": 40.0,
        "actual_fee": 48.0,  # $8 difference but 20%
        "fee_type": "percentage",
        "percent_rate": 0.000417
    }
    
    # Act
    variance = calculate_variance(type('Payment', (), payment))
    
    # Assert
    assert variance["status"] == "alert"  # Still alert despite small dollar amount
    assert variance["difference"] == 8.0
    assert variance["percent_difference"] == 20.0

def test_variance_negative(setup_test_data):
    """Test negative variance calculation."""
    # Arrange
    payment = {
        "expected_fee": 3750.0,
        "actual_fee": 3000.0,
        "fee_type": "flat",
        "percent_rate": None
    }
    
    # Act
    variance = calculate_variance(type('Payment', (), payment))
    
    # Assert
    assert variance["status"] == "alert"  # >15% difference
    assert variance["difference"] == -750.0
    assert variance["percent_difference"] == -20.0

def test_variance_with_null_expected_fee(setup_test_data):
    """Test variance calculation with NULL expected fee."""
    # Arrange
    payment = {
        "expected_fee": None,
        "actual_fee": 3750.0,
        "fee_type": "flat",
        "percent_rate": None,
        "total_assets": None
    }
    
    # Act
    variance = calculate_variance(type('Payment', (), payment))
    
    # Assert
    assert variance["status"] == "unknown"
    assert variance["message"] == "Cannot calculate"
    assert variance["difference"] is None
    assert variance["percent_difference"] is None

def test_variance_with_calculated_expected_fee(setup_test_data):
    """Test variance with calculated expected fee from AUM and rate."""
    # Arrange
    payment = {
        "expected_fee": None,
        "actual_fee": 4200.0,
        "fee_type": "percentage",
        "percent_rate": 0.00125,
        "total_assets": 3000000.0
    }
    
    # Act
    variance = calculate_variance(type('Payment', (), payment))
    
    # Assert
    assert variance["status"] == "warning"
    assert variance["difference"] == pytest.approx(450.0, 0.01)
    assert variance["percent_difference"] == pytest.approx(12.0, 0.01)