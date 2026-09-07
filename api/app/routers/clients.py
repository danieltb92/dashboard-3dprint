from fastapi import APIRouter

router = APIRouter()


@router.get("/")
def get_clients():
    return {"message": "List of clients"}
