from services.client_service import get_all_clients
from core.config import DB_PATH
import os

print(os.getenv("DB_PATH"))
print(f"Database path: {DB_PATH}")
print(f"Database file exists: {os.path.exists(DB_PATH)}")

try:
    print("Attempting to get all clients...")
    result = get_all_clients()
    print(f"Query successful, found {len(result)} clients")
    # Print the first client if available
    if result:
        print("First client:", result[0])
except Exception as e:
    print(f"ERROR: {str(e)}")
    # Print more details about the error
    import traceback
    traceback.print_exc() 

    