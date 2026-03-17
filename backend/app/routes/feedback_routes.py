from typing import Optional

from fastapi import APIRouter, Header, HTTPException
from pydantic import BaseModel

from app.services.firebase_admin import verify_bearer_token
from app.services.supabase_client import insert_beta_feedback

router = APIRouter(prefix="/api/v1/feedback", tags=["Feedback"])


class BetaFeedbackBody(BaseModel):
    message: str
    email: Optional[str] = None
    page: Optional[str] = None


@router.post("")
def submit_beta_feedback(
    body: BetaFeedbackBody,
    user_agent: str = Header(default=""),
    authorization: str = Header(default=""),
):
    msg = (body.message or "").strip()
    if len(msg) < 10:
        raise HTTPException(status_code=400, detail="Message must be at least 10 characters.")

    firebase_uid = None
    if authorization:
        try:
            decoded = verify_bearer_token(authorization)
            firebase_uid = decoded.get("uid")
        except Exception:
            # Allow anonymous feedback if token is missing/invalid
            firebase_uid = None

    try:
        insert_beta_feedback(
            {
                "firebase_uid": firebase_uid,
                "email": (body.email or "").strip() or None,
                "message": msg,
                "page": (body.page or "").strip() or None,
                "user_agent": user_agent or None,
            }
        )
        return {"ok": True}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

