from fastapi import APIRouter

router = APIRouter()


@router.get("/")
def get_quotes():
    return {"message": "List of quotes"}
