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

router = APIRouter(tags=["payments"])

@router.get("/clients/{client_id}/payments", response_model=List[PaymentWithDetails])
async def read_client_payments(
    client_id: int,
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(10, ge=1, le=100, description="Items per page"),
    year: Optional[int] = Query(None, description="Filter by year")
):
    try:
        payments = get_client_payments(
            client_id=client_id, 
            page=page, 
            limit=limit, 
            year=year
        )
        return payments
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/payments/{payment_id}", response_model=PaymentWithDetails)
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

@router.post("/payments", response_model=Payment)
async def create_new_payment(payment: PaymentCreate):
    try:
        result = create_payment(payment)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/payments/{payment_id}", response_model=Payment)
async def update_existing_payment(
    payment_id: int = Path(..., ge=1),
    payment: PaymentCreate = None
):
    try:
        result = update_payment(payment_id, payment)
        if not result:
            raise HTTPException(status_code=404, detail="Payment not found")
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/payments/{payment_id}", status_code=204)
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

@router.get("/contracts/{contract_id}/periods", response_model=AvailablePeriods)
async def read_available_periods(
    contract_id: int,
    client_id: int = Query(..., description="Client ID is required"),
):
    try:
        periods = get_available_periods(contract_id, client_id)
        return {"periods": periods}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))