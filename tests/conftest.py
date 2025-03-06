import pytest
import sqlite3
import os
from contextlib import contextmanager
from datetime import datetime, timedelta

# Import app modules with correct paths
from backend.core.database import dict_factory
from backend.models.payments import PaymentCreate

# Create database fixture
@pytest.fixture
def test_db():
    """Create an in-memory SQLite database for testing."""
    # Get the schema from the DB schema file
    schema_path = os.path.join(os.path.dirname(__file__), "..", "backend", "data", "clean_schema.sql")
    
    # Create in-memory database
    conn = sqlite3.connect(":memory:")
    conn.row_factory = dict_factory
    
    # Load and execute schema
    with open(schema_path, "r") as f:
        schema_sql = f.read()
        conn.executescript(schema_sql)
    
    # Return the connection
    return conn

# Mock the database connection
@pytest.fixture
def mock_db_connection(test_db, monkeypatch):
    """Mock the database connection function to use in-memory DB."""
    @contextmanager
    def mock_get_db_connection():
        try:
            yield test_db
        finally:
            pass  # Don't close in-memory DB between calls
    
    # Replace the real connection function with our mock
    monkeypatch.setattr("backend.core.database.get_db_connection", mock_get_db_connection)
    return test_db

# Mock execute_query function
@pytest.fixture
def mock_execute_query(mock_db_connection, monkeypatch):
    """Mock the execute_query function to use in-memory DB."""
    def mock_exec_query(query, params=None, fetch_one=False):
        cursor = mock_db_connection.cursor()
        
        if params:
            cursor.execute(query, params)
        else:
            cursor.execute(query)
            
        if query.strip().upper().startswith(("INSERT", "UPDATE", "DELETE")):
            mock_db_connection.commit()
            return {"lastrowid": cursor.lastrowid, "rowcount": cursor.rowcount}
        
        if fetch_one:
            return cursor.fetchone()
        
        return cursor.fetchall()
    
    # Replace the real execute_query with our mock
    monkeypatch.setattr("backend.core.database.execute_query", mock_exec_query)
    return mock_exec_query

@pytest.fixture
def setup_test_data(mock_db_connection):
    """Insert test data into the database."""
    # Insert test clients
    mock_db_connection.executescript("""
        INSERT INTO clients (client_id, display_name, full_name, ima_signed_date) 
        VALUES (1, 'Percentage Monthly', 'PERCENTAGE MONTHLY CLIENT', '2020-01-01');
        
        INSERT INTO clients (client_id, display_name, full_name, ima_signed_date) 
        VALUES (2, 'Flat Quarterly', 'FLAT QUARTERLY CLIENT', '2020-01-01');
        
        INSERT INTO clients (client_id, display_name, full_name, ima_signed_date) 
        VALUES (3, 'Split Payment', 'SPLIT PAYMENT CLIENT', '2020-01-01');
        
        -- Insert contracts
        INSERT INTO contracts (contract_id, client_id, provider_name, fee_type, percent_rate, flat_rate, payment_schedule, num_people) 
        VALUES (1, 1, 'Test Provider', 'percentage', 0.000417, NULL, 'monthly', 10);
        
        INSERT INTO contracts (contract_id, client_id, provider_name, fee_type, percent_rate, flat_rate, payment_schedule, num_people) 
        VALUES (2, 2, 'Test Provider', 'flat', NULL, 3750.0, 'quarterly', 25);
        
        INSERT INTO contracts (contract_id, client_id, provider_name, fee_type, percent_rate, flat_rate, payment_schedule, num_people) 
        VALUES (3, 3, 'Test Provider', 'flat', NULL, 1250.0, 'monthly', 50);
        
        -- Insert client_metrics
        INSERT INTO client_metrics (id, client_id, last_payment_date, last_payment_amount, last_payment_quarter, last_payment_year, last_recorded_assets) 
        VALUES (1, 1, '2024-01-15', 40.0, 1, 2024, 96000.0);
        
        INSERT INTO client_metrics (id, client_id, last_payment_date, last_payment_amount, last_payment_quarter, last_payment_year) 
        VALUES (2, 2, '2024-02-15', 3750.0, 1, 2024);
        
        INSERT INTO client_metrics (id, client_id, last_payment_date, last_payment_amount, last_payment_quarter, last_payment_year) 
        VALUES (3, 3, '2024-01-10', 5000.0, 1, 2024);
        
        -- Insert payments
        -- Regular monthly percentage payment
        INSERT INTO payments (payment_id, contract_id, client_id, received_date, total_assets, expected_fee, actual_fee, applied_start_month, applied_start_month_year, applied_end_month, applied_end_month_year)
        VALUES (1, 1, 1, '2024-01-15', 96000.0, 40.0, 40.0, 1, 2024, 1, 2024);
        
        -- Regular quarterly flat payment
        INSERT INTO payments (payment_id, contract_id, client_id, received_date, expected_fee, actual_fee, applied_start_quarter, applied_start_quarter_year, applied_end_quarter, applied_end_quarter_year)
        VALUES (2, 2, 2, '2024-02-15', 3750.0, 3750.0, 1, 2024, 1, 2024);
        
        -- Split payment covering 3 months
        INSERT INTO payments (payment_id, contract_id, client_id, received_date, expected_fee, actual_fee, applied_start_month, applied_start_month_year, applied_end_month, applied_end_month_year)
        VALUES (3, 3, 3, '2024-01-10', 3750.0, 5000.0, 1, 2024, 3, 2024);
    """)
    
    return mock_db_connection