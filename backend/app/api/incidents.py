from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from ..database import get_db
from .. import models

router = APIRouter()

@router.get("/incidents")
def list_incidents(
    db: Session = Depends(get_db),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, le=100),
    status: Optional[str] = None
):
    query = db.query(models.Incident).order_by(models.Incident.timestamp.desc())
    if status:
        query = query.filter(models.Incident.status == status)
    
    total = query.count()
    incidents = query.offset(skip).limit(limit).all()
    
    return {
        "total": total,
        "items": [
            {
                "id": i.id,
                "timestamp": i.timestamp,
                "route": i.route,
                "severity": i.severity,
                "category": i.category,
                "status": i.status
            }
            for i in incidents
        ]
    }

@router.get("/incidents/{incident_id}")
def get_incident(incident_id: str, db: Session = Depends(get_db)):
    i = db.query(models.Incident).filter(models.Incident.id == incident_id).first()
    if not i:
        return {"error": "Not found"}
    
    trace = db.query(models.Trace).filter(models.Trace.id == i.trace_id).first()
    reviews = db.query(models.ReviewTask).filter(models.ReviewTask.incident_id == incident_id).all()
    
    return {
        "id": i.id,
        "timestamp": i.timestamp,
        "route": i.route,
        "severity": i.severity,
        "category": i.category,
        "status": i.status,
        "trace_id": i.trace_id,
        "trace": {
            "request": trace.request if trace else None,
            "response": trace.response if trace else None,
            "risk_score": trace.risk_score if trace else None,
        },
        "reviews": [
            {
                "id": r.id,
                "status": r.status,
                "notes": r.reviewer_notes
            } for r in reviews
        ]
    }
