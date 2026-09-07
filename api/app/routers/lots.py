from fastapi import APIRouter

router = APIRouter()


@router.get("/")
def get_lots():
    return {"message": "List of lots"}
