import pytest
from datetime import datetime, timedelta
from tests.utils.fee_utils import generate_fee_references

def test_fee_reference_monthly_flat(setup_test_data):
    """Test fee reference for monthly flat fee."""
    # Arrange
    contract = {
        "fee_type": "flat",
        "flat_rate": 1250.0,
        "payment_schedule": "monthly"
    }
    
    # Act
    references = generate_fee_references(contract)
    
    # Assert
    assert references["monthly"] == "$1,250.00"
    assert references["quarterly"] == "$3,750.00"
    assert references["annual"] == "$15,000.00"

def test_fee_reference_quarterly_flat(setup_test_data):
    """Test fee reference for quarterly flat fee."""
    # Arrange
    contract = {
        "fee_type": "flat",
        "flat_rate": 3750.0,
        "payment_schedule": "quarterly"
    }
    
    # Act
    references = generate_fee_references(contract)
    
    # Assert
    assert references["monthly"] == "$1,250.00"
    assert references["quarterly"] == "$3,750.00"
    assert references["annual"] == "$15,000.00"

def test_fee_reference_monthly_percentage(setup_test_data):
    """Test fee reference for monthly percentage fee."""
    # Arrange
    contract = {
        "fee_type": "percentage",
        "percent_rate": 0.000417,
        "payment_schedule": "monthly"
    }
    
    # Act
    references = generate_fee_references(contract)
    
    # Assert
    assert references["monthly"] == "0.0417%"
    assert references["quarterly"] == "0.1251%"
    assert references["annual"] == "0.5004%"

def test_fee_reference_quarterly_percentage(setup_test_data):
    """Test fee reference for quarterly percentage fee."""
    # Arrange
    contract = {
        "fee_type": "percentage",
        "percent_rate": 0.00125,
        "payment_schedule": "quarterly"
    }
    
    # Act
    references = generate_fee_references(contract)
    
    # Assert
    assert references["monthly"] == "0.0417%"
    assert references["quarterly"] == "0.1250%"
    assert references["annual"] == "0.5000%"