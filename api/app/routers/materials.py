from fastapi import APIRouter

router = APIRouter()


@router.get("/")
def get_materials():
    return {"message": "List of materials"}
