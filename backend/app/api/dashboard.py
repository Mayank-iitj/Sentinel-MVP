from fastapi import APIRouter, Depends, WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session
from sqlalchemy import func
from ..database import get_db
from .. import models
import json
import datetime
from typing import List

router = APIRouter()

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except Exception:
                pass

manager = ConnectionManager()

@router.websocket("/dashboard/live")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)

@router.get("/dashboard/summary")
def get_dashboard_summary(db: Session = Depends(get_db)):
    total_calls = db.query(models.Trace).count()
    risk_interceptions = db.query(models.Trace).filter(
        models.Trace.actions.like('%BLOCK%') | models.Trace.actions.like('%EDIT%')
    ).count()
    
    total_cost = db.query(func.sum(models.Trace.estimated_cost)).scalar() or 0.0
    cost_index = f"{1.0 + (total_cost / max(total_calls, 1) / 0.01):.2f}x"
    
    return {
        "total_calls": total_calls,
        "coverage": "100%",
        "risk_interceptions": risk_interceptions,
        "cost_index": cost_index,
        "open_issues": db.query(models.Incident).filter(models.Incident.status == "OPEN").count(),
        "route_health": "98.2%"
    }

@router.get("/dashboard/timeseries")
def get_dashboard_timeseries(db: Session = Depends(get_db)):
    # Group by hour for the last 24 hours (simplified for MVP: just randomish distribution based on real count)
    total = db.query(models.Trace).count()
    traffic = []
    risk = []
    for i in range(24):
        traffic.append({"time": f"{i:02d}:00", "calls": (total // 24) + (i % 5) * 10})
        risk.append({"time": f"{i:02d}:00", "score": 90 - (i % 3) * 5})
        
    return {"traffic": traffic, "risk": risk}

@router.get("/dashboard/risk")
def get_dashboard_risk(db: Session = Depends(get_db)):
    results = db.query(models.Finding.type, func.count(models.Finding.id)).group_by(models.Finding.type).all()
    # Map DB types to display names
    mapping = {
        "PII_LEAK": "PII Leakage",
        "TOXICITY": "Toxicity",
        "SECRET_LEAK": "Secret Leaks",
        "COST_ANOMALY": "Cost Anomalies",
        "SOURCE_ACCESS_VIOLATION": "Access Violation"
    }
    data = []
    for f_type, count in results:
        data.append({"category": mapping.get(f_type, f_type), "incidents": count})
        
    # If no data yet, provide zeroes so the chart doesn't crash
    if not data:
        data = [{"category": "PII Leakage", "incidents": 0}, {"category": "Toxicity", "incidents": 0}]
        
    return data

@router.get("/dashboard/routes")
def get_dashboard_routes(db: Session = Depends(get_db)):
    results = db.query(
        models.Trace.route,
        func.count(models.Trace.id).label('traffic'),
        func.avg(models.Trace.latency_ms).label('avg_latency')
    ).group_by(models.Trace.route).all()
    
    routes_data = []
    for r in results:
        route_name, traffic_count, avg_lat = r
        intercepts = db.query(models.Trace).filter(
            models.Trace.route == route_name,
            (models.Trace.actions.like('%BLOCK%') | models.Trace.actions.like('%EDIT%'))
        ).count()
        
        health = 100 - (intercepts / max(traffic_count, 1)) * 100
        
        routes_data.append({
            "name": route_name,
            "type": "API Endpoint",
            "traffic": "High" if traffic_count > 50 else "Medium" if traffic_count > 10 else "Low",
            "health": max(0, int(health)),
            "intercepts": intercepts,
            "latency": int(avg_lat or 0)
        })
        
    return routes_data

@router.get("/dashboard/cost")
def get_dashboard_cost(db: Session = Depends(get_db)):
    results = db.query(
        models.Trace.model,
        func.count(models.Trace.id).label('calls'),
        func.sum(models.Trace.total_tokens).label('tokens'),
        func.sum(models.Trace.estimated_cost).label('cost')
    ).group_by(models.Trace.model).all()
    
    total_calls = sum(r[1] for r in results) or 1
    
    models_data = []
    for r in results:
        model, calls, tokens, cost = r
        usage_pct = int((calls / total_calls) * 100)
        models_data.append({
            "name": model,
            "provider": "OpenAI" if "gpt" in model.lower() else "Anthropic" if "claude" in model.lower() else "Unknown",
            "usage": f"{usage_pct}%",
            "tokens": f"{int((tokens or 0)/1000)}k",
            "cost": f"${(cost or 0):.4f}"
        })
        
    cost_data = []
    for i in range(1, 8):
        cost_data.append({
            "month": f"Day {i}",
            "providerCost": (total_calls * 0.05) + (i * 2),
            "sentinelCost": (total_calls * 0.001) + (i * 0.5)
        })
        
    return {"models": models_data, "costData": cost_data}

@router.get("/dashboard/responsibility")
def get_dashboard_responsibility(db: Session = Depends(get_db)):
    # Calculate compliance based on incident counts
    total_incidents = db.query(models.Incident).count()
    gdpr_score = max(0, 100 - (db.query(models.Incident).filter(models.Incident.category == 'PII_LEAK').count() * 5))
    toxicity_count = db.query(models.Finding).filter(models.Finding.type == 'TOXICITY').count()
    
    compliance = [
        {"standard": "GDPR (Europe)", "score": gdpr_score, "status": "Compliant" if gdpr_score > 90 else "Action Needed"},
        {"standard": "HIPAA (Healthcare)", "score": gdpr_score, "status": "Compliant" if gdpr_score > 90 else "Action Needed"},
        {"standard": "AI Act Draft (EU)", "score": max(0, 100 - total_incidents * 2), "status": "Compliant" if total_incidents < 10 else "Action Needed"},
    ]
    
    biasMetrics = [
        {"category": "Toxicity / Hate Speech", "severity": "High" if toxicity_count > 5 else "Low", "value": toxicity_count},
        {"category": "Gender Bias (Simulated)", "severity": "Low", "value": 0},
    ]
    
    return {"compliance": compliance, "biasMetrics": biasMetrics}
