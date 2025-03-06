import pytest
from backend.services.payment_service import (
    get_client_payments, get_payment_by_id, delete_payment,
    enhance_payment_with_details
)

def test_get_client_payments_basic(setup_test_data, mock_execute_query):
    """Test retrieving client payments with default parameters."""
    # Act
    payments = get_client_payments(1)
    
    # Assert
    assert len(payments) == 1
    assert payments[0].payment_id == 1
    assert payments[0].actual_fee == 40.0

def test_get_client_payments_pagination(setup_test_data, mock_execute_query):
    """Test payment pagination."""
    # Arrange - Add more payments
    conn = setup_test_data
    for i in range(4, 14):
        conn.execute("""
            INSERT INTO payments (payment_id, contract_id, client_id, received_date, actual_fee, 
                              applied_start_month, applied_start_month_year, applied_end_month, applied_end_month_year)
            VALUES (?, 1, 1, ?, 40.0, 1, 2024, 1, 2024)
        """, (i, f"2024-{i:02d}-15"))
    conn.commit()
    
    # Act
    page1 = get_client_payments(1, page=1, limit=5)
    page2 = get_client_payments(1, page=2, limit=5)
    
    # Assert
    assert len(page1) == 5
    assert len(page2) == 5
    assert page1[0].payment_id != page2[0].payment_id

def test_get_client_payments_filter_by_year(setup_test_data, mock_execute_query):
    """Test filtering payments by year."""
    # Arrange - Add payment for different year
    conn = setup_test_data
    conn.execute("""
        INSERT INTO payments (payment_id, contract_id, client_id, received_date, actual_fee, 
                          applied_start_month, applied_start_month_year, applied_end_month, applied_end_month_year)
        VALUES (14, 1, 1, '2023-12-15', 38.0, 12, 2023, 12, 2023)
    """)
    conn.commit()
    
    # Act
    payments_2024 = get_client_payments(1, year=2024)
    payments_2023 = get_client_payments(1, year=2023)
    
    # Assert
    assert all(p.applied_start_month_year == 2024 for p in payments_2024)
    assert all(p.applied_start_month_year == 2023 for p in payments_2023)

def test_get_payment_by_id(setup_test_data, mock_execute_query):
    """Test retrieving specific payment by ID."""
    # Act
    payment = get_payment_by_id(1)
    
    # Assert
    assert payment is not None
    assert payment.payment_id == 1
    assert payment.actual_fee == 40.0

def test_delete_payment(setup_test_data, mock_execute_query):
    """Test deleting a payment."""
    # Act
    result = delete_payment(1)
    
    # Assert
    assert result is True
    
    # Check payment is marked as deleted
    conn = setup_test_data
    cursor = conn.cursor()
    cursor.execute("SELECT valid_to FROM payments WHERE payment_id = 1")
    payment = cursor.fetchone()
    assert payment["valid_to"] is not None