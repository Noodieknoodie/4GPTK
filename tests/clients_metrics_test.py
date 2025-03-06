import pytest
from datetime import datetime, timedelta
from backend.services.client_service import get_client_by_id, get_client_summary
from backend.services.payment_service import update_client_metrics, create_payment, delete_payment
from backend.models.payments import PaymentCreate

def test_update_client_metrics_new_payment(setup_test_data, mock_execute_query):
    """Test client metrics update after new payment."""
    # Arrange
    conn = setup_test_data
    payment_data = PaymentCreate(
        contract_id=1,
        client_id=1,
        received_date="2024-03-15",
        total_assets=120000.0,
        expected_fee=50.0,
        actual_fee=50.0,
        method="check",
        notes="Test payment",
        applied_start_month=3,
        applied_start_month_year=2024,
        applied_end_month=3,
        applied_end_month_year=2024
    )
    
    # Act
    new_payment = create_payment(payment_data)
    
    # Assert
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM client_metrics WHERE client_id = 1")
    metrics = cursor.fetchone()
    
    assert metrics["last_payment_date"] == "2024-03-15"
    assert metrics["last_payment_amount"] == 50.0
    assert metrics["last_recorded_assets"] == 120000.0

def test_update_client_metrics_after_delete(setup_test_data, mock_execute_query):
    """Test client metrics update after payment deletion."""
    # Arrange - Add second payment
    conn = setup_test_data
    conn.execute("""
        INSERT INTO payments (payment_id, contract_id, client_id, received_date, total_assets, expected_fee, actual_fee,
                          applied_start_month, applied_start_month_year, applied_end_month, applied_end_month_year)
        VALUES (20, 1, 1, '2024-02-15', 100000.0, 41.7, 41.7, 2, 2024, 2, 2024)
    """)
    conn.commit()
    
    # Act - Delete most recent payment
    delete_payment(1)  # Delete Jan payment (most recent)
    
    # Assert - Should fall back to Feb payment
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM client_metrics WHERE client_id = 1")
    metrics = cursor.fetchone()
    
    assert metrics["last_payment_date"] == "2024-02-15"
    assert metrics["last_payment_amount"] == 41.7
    assert metrics["last_recorded_assets"] == 100000.0