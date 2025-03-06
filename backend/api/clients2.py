from fastapi import APIRouter

router = APIRouter(prefix="/clients", tags=["clients"])

@router.get("/")
async def read_clients():
    return {"message": "Hello from /clients endpoint!"}