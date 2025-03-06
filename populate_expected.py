#!/usr/bin/env python
"""
Script to populate missing expected_fee values in the payments table.
"""
import sqlite3
import os
import sys
from datetime import datetime

# Database file path - adjust if needed
DB_PATH = "backend/data/401k_payments.db"  # Adjust this path to your actual database location

def main():
    # Ensure the database file exists
    if not os.path.exists(DB_PATH):
        print(f"Error: Database file not found at {DB_PATH}")
        print("Please adjust the DB_PATH variable in the script to your actual database location.")
        sys.exit(1)

    # Create a backup of the database
    backup_path = f"{DB_PATH}.backup_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
    try:
        with open(DB_PATH, 'rb') as src, open(backup_path, 'wb') as dst:
            dst.write(src.read())
        print(f"Database backup created at: {backup_path}")
    except Exception as e:
        print(f"Warning: Could not create database backup: {e}")
        response = input("Continue without backup? (y/n): ")
        if response.lower() != 'y':
            print("Operation cancelled.")
            sys.exit(0)

    # Connect to the database
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    try:
        # Find all payments with NULL expected_fee
        find_query = """
        SELECT 
            p.payment_id, p.total_assets, p.actual_fee, 
            c.fee_type, c.percent_rate, c.flat_rate
        FROM 
            payments p
        JOIN 
            contracts c ON p.contract_id = c.contract_id
        WHERE 
            p.expected_fee IS NULL AND 
            p.valid_to IS NULL AND
            c.valid_to IS NULL
        """
        cursor.execute(find_query)
        payments = cursor.fetchall()

        if not payments:
            print("No payments with missing expected_fee values found.")
            return

        print(f"Found {len(payments)} payments with missing expected_fee values.")
        
        # Process each payment
        updates = []
        skipped = []
        for payment in payments:
            payment_id = payment['payment_id']
            total_assets = payment['total_assets']
            fee_type = payment['fee_type'].lower() if payment['fee_type'] else None
            
            expected_fee = None
            
            # For fixed rate contracts
            if fee_type == 'flat' and payment['flat_rate'] is not None:
                expected_fee = payment['flat_rate']
                updates.append((expected_fee, payment_id))
            
            # For percentage rate contracts with AUM
            elif fee_type == 'percentage' and payment['percent_rate'] is not None and total_assets is not None:
                expected_fee = total_assets * payment['percent_rate']
                updates.append((expected_fee, payment_id))
            
            # Skip if we can't calculate expected fee
            else:
                skipped.append(payment_id)
        
        # Update the database
        if updates:
            update_query = """
            UPDATE payments
            SET expected_fee = ?
            WHERE payment_id = ?
            """
            cursor.executemany(update_query, updates)
            conn.commit()
            
            print(f"Successfully updated {len(updates)} payment records with calculated expected_fee values.")
            
            # Show some examples of updates
            print("\nExample updates:")
            for i, (expected_fee, payment_id) in enumerate(updates[:5]):
                print(f"  Payment ID {payment_id}: Expected fee set to ${expected_fee:.2f}")
                if i >= 4 and len(updates) > 5:
                    print(f"  ... and {len(updates) - 5} more")
                    break
        
        if skipped:
            print(f"\nSkipped {len(skipped)} payments where expected_fee could not be calculated.")
            print("First few payment IDs:", skipped[:5], "..." if len(skipped) > 5 else "")

    except Exception as e:
        conn.rollback()
        print(f"Error: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    main()