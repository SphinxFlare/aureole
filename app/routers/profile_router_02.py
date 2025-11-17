# routers/profile_router_02.py


from fastapi import APIRouter, Depends, File, UploadFile, HTTPException, Form
from sqlalchemy.orm import Session
from uuid import UUID, uuid4
import shutil
import os
from sqlalchemy.ext.asyncio import AsyncSession
from db.session import get_db
from utils.deps import get_current_user
from models.user_model import VerificationAttempt, UserMedia

router = APIRouter(prefix="/profile", tags=["Profile Verification"])

UPLOAD_DIR = "uploads/verification_photos"
os.makedirs(UPLOAD_DIR, exist_ok=True)



@router.post("/verify-photo")
async def upload_media(
    file: UploadFile = File(...),
    is_verification: bool = Form(False),
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
):
    if file.content_type not in ["image/jpeg", "image/png", "video/mp4"]:
        raise HTTPException(status_code=400, detail="Only JPEG, PNG, or MP4 allowed")

    media_type = "video" if file.content_type.startswith("video/") else "image"

    ext = file.filename.split('.')[-1] if '.' in file.filename else "jpg"
    filename = f"{current_user.id}_{uuid4().hex}.{ext}"

    # Local filesystem path
    local_path = os.path.join(UPLOAD_DIR, filename)

    # Save file
    with open(local_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Public URL (this is what frontend MUST receive)
    base_url = "http://127.0.0.1:8000"
    public_url = f"{base_url}/{UPLOAD_DIR}/{filename}"

    # If verification upload → update user verified fields
    if is_verification:
        attempt = VerificationAttempt(
            user_id=current_user.id,
            photo_path=public_url,
            status="pending",
        )
        db.add(attempt)

        current_user.is_verified = True
        current_user.profile_photo = public_url   # <-- FIXED

    # Store media entry
    media = UserMedia(
        user_id=current_user.id,
        file_path=public_url,   # <-- FIXED
        media_type=media_type,
        is_verified=is_verification
    )

    db.add(media)
    await db.commit()
    await db.refresh(media)

    return {
        "msg": "Media uploaded",
        "media_id": str(media.id),
        "is_verified": is_verification,
        "media_type": media_type,
        "url": public_url,  # optional
    }
