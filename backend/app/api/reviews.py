from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from ..database import get_db
from .. import models

router = APIRouter()

class VerdictRequest(BaseModel):
    verdict: str # APPROVED or REJECTED

@router.post("/reviews/{review_id}/verdict")
def submit_verdict(review_id: str, request: VerdictRequest, db: Session = Depends(get_db)):
    review = db.query(models.ReviewTask).filter(models.ReviewTask.id == review_id).first()
    if not review:
        raise HTTPException(status_code=404, detail="Review task not found")
        
    incident = db.query(models.Incident).filter(models.Incident.id == review.incident_id).first()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
        
    review.status = "RESOLVED" if request.verdict == "APPROVED" else "REJECTED"
    incident.status = "RESOLVED" if request.verdict == "APPROVED" else "OPEN"
    
    db.commit()
    
    return {"status": "success", "review_status": review.status, "incident_status": incident.status}
