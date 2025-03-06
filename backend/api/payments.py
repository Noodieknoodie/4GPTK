from fastapi import APIRouter, HTTPException, Query, Path
from typing import List, Optional

from models.payments import Payment, PaymentCreate, PaymentWithDetails, AvailablePeriods
from services.payment_service import (
    get_client_payments, 
    get_payment_by_id,
    create_payment,
    update_payment,
    delete_payment,
    get_available_periods
)

# Main payments router
router = APIRouter(prefix="/payments", tags=["payments"])

# Create a client payments router to match the expected endpoint structure
client_payments_router = APIRouter(prefix="/clients", tags=["client-payments"])

@client_payments_router.get("/{client_id}/payments", response_model=List[PaymentWithDetails])
async def read_client_payments(
    client_id: int,
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(10, ge=1, le=100, description="Items per page"),
    year: Optional[int] = Query(None, description="Filter by year")
):
    try:
        # Convert year to int if it's a valid integer string, otherwise use None
        filtered_year = year
        if isinstance(year, str) and year.lower() == 'null':
            filtered_year = None
            
        payments = get_client_payments(
            client_id=client_id, 
            page=page, 
            limit=limit, 
            year=filtered_year
        )
        return payments
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{payment_id}", response_model=PaymentWithDetails)
async def read_payment(payment_id: int = Path(..., ge=1)):
    try:
        payment = get_payment_by_id(payment_id)
        if not payment:
            raise HTTPException(status_code=404, detail="Payment not found")
        return payment
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/", response_model=Payment)
async def create_new_payment(payment: PaymentCreate):
    try:
        new_payment = create_payment(payment)
        return new_payment
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.put("/{payment_id}", response_model=Payment)
async def update_existing_payment(
    payment_id: int = Path(..., ge=1),
    payment: PaymentCreate = None
):
    try:
        updated_payment = update_payment(payment_id, payment)
        if not updated_payment:
            raise HTTPException(status_code=404, detail="Payment not found")
        return updated_payment
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/{payment_id}", status_code=204)
async def delete_existing_payment(payment_id: int = Path(..., ge=1)):
    try:
        success = delete_payment(payment_id)
        if not success:
            raise HTTPException(status_code=404, detail="Payment not found")
        return None
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Create a contracts router for periods endpoint
contracts_router = APIRouter(prefix="/contracts", tags=["contract-periods"])

@contracts_router.get("/{contract_id}/periods", response_model=AvailablePeriods)
async def read_available_periods(
    contract_id: int,
    client_id: int = Query(..., description="Client ID is required"),
):
    try:
        periods = get_available_periods(contract_id, client_id)
        return periods
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))