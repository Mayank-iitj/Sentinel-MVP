from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from ..database import get_db
from .. import models
import json

router = APIRouter()

@router.get("/traces")
def list_traces(
    db: Session = Depends(get_db),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, le=100),
    route: Optional[str] = None
):
    query = db.query(models.Trace).order_by(models.Trace.timestamp.desc())
    if route:
        query = query.filter(models.Trace.route == route)
    
    total = query.count()
    traces = query.offset(skip).limit(limit).all()
    
    return {
        "total": total,
        "items": [
            {
                "id": t.id,
                "timestamp": t.timestamp,
                "route": t.route,
                "model": t.model,
                "risk_score": t.risk_score,
                "action": json.loads(t.actions).get("action", "OBSERVE") if t.actions else "OBSERVE"
            }
            for t in traces
        ]
    }

@router.get("/traces/{trace_id}")
def get_trace(trace_id: str, db: Session = Depends(get_db)):
    t = db.query(models.Trace).filter(models.Trace.id == trace_id).first()
    if not t:
        return {"error": "Not found"}
    
    findings = db.query(models.Finding).filter(models.Finding.trace_id == trace_id).all()
    
    return {
        "id": t.id,
        "timestamp": t.timestamp,
        "user_id": t.user_id,
        "application": t.application,
        "route": t.route,
        "provider": t.provider,
        "model": t.model,
        "request": t.request,
        "response": t.response,
        "input_tokens": t.input_tokens,
        "output_tokens": t.output_tokens,
        "total_tokens": t.total_tokens,
        "estimated_cost": t.estimated_cost,
        "latency_ms": t.latency_ms,
        "risk_score": t.risk_score,
        "performance_score": t.performance_score,
        "cost_score": t.cost_score,
        "responsibility_score": t.responsibility_score,
        "status": t.status,
        "cohort": t.cohort,
        "actions": json.loads(t.actions) if t.actions else {},
        "citations": json.loads(t.citations) if t.citations else [],
        "findings": [
            {
                "type": f.type,
                "severity": f.severity,
                "message": f.message,
                "evidence": f.evidence,
                "action": f.recommended_action
            } for f in findings
        ]
    }
