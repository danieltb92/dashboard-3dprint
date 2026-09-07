from fastapi import APIRouter

router = APIRouter()


@router.get("/")
def get_printers():
    return {"message": "List of printers"}
