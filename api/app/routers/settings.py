from fastapi import APIRouter

router = APIRouter()


@router.get("/")
def get_settings():
    return {"message": "List of settings"}
