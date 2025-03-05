import sqlite3
from contextlib import contextmanager
from typing import Dict, List, Tuple, Union, Any

from .config import DB_PATH

def dict_factory(cursor, row):
    return {col[0]: row[idx] for idx, col in enumerate(cursor.description)}

@contextmanager
def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = dict_factory
    try:
        yield conn
    finally:
        conn.close()

def execute_query(
    query: str, 
    params: Union[Tuple, Dict, List] = None, 
    fetch_one: bool = False
) -> List[Dict[str, Any]]:
    with get_db_connection() as conn:
        cursor = conn.cursor()
        
        if params:
            cursor.execute(query, params)
        else:
            cursor.execute(query)
            
        if query.strip().upper().startswith(("INSERT", "UPDATE", "DELETE")):
            conn.commit()
            return {"lastrowid": cursor.lastrowid, "rowcount": cursor.rowcount}
        
        if fetch_one:
            return cursor.fetchone()
        
        return cursor.fetchall()