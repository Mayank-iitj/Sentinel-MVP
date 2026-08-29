from fastapi import APIRouter, Depends, BackgroundTasks
from sqlalchemy.orm import Session
from ..database import get_db
from ..schemas import InterceptRequest, NormalizedResponse
from ..engine.provider import MockProvider
from ..engine.detectors import FastLaneDetector
from ..engine.policy import PolicyEngine
from .dashboard import manager
from .. import models
import json
import uuid

router = APIRouter()
provider = MockProvider()
detector = FastLaneDetector()
policy_engine = PolicyEngine()

@router.post("/intercept")
def intercept_request(request: InterceptRequest, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    response: NormalizedResponse = provider.generate(
        prompt=request.prompt,
        model=request.model,
        simulate_scenario=request.simulate_scenario
    )
    
    findings = detector.run_all(response, request)
    evaluation = policy_engine.evaluate(response, findings)
    
    trace = models.Trace(
        id=response.request_id,
        user_id=request.user_id,
        application=request.application,
        route=request.route,
        provider=response.provider,
        model=response.model,
        request=request.prompt,
        response=response.content,
        input_tokens=response.input_tokens,
        output_tokens=response.output_tokens,
        total_tokens=response.total_tokens,
        latency_ms=response.latency_ms,
        risk_score=evaluation.risk_score,
        performance_score=evaluation.performance_score,
        cost_score=evaluation.cost_score,
        responsibility_score=evaluation.responsibility_score,
        status="PROCESSED",
        cohort=request.cohort,
        actions=json.dumps({"action": evaluation.action}),
        citations=json.dumps([c.model_dump() for c in response.citations])
    )
    db.add(trace)
    
    highest_severity_finding = max(findings, key=lambda x: {"CRITICAL": 4, "HIGH": 3, "MEDIUM": 2, "LOW": 1}.get(x.severity, 0)) if findings else None
    
    for f in findings:
        db_finding = models.Finding(
            id=f"fnd_{uuid.uuid4().hex[:8]}",
            trace_id=response.request_id,
            type=f.type,
            severity=f.severity,
            confidence=f.confidence,
            detector=f.detector,
            message=f.message,
            evidence=f.evidence,
            recommended_action=f.recommended_action
        )
        db.add(db_finding)
        
    if evaluation.action in ["BLOCK", "ESCALATE"]:
        incident = models.Incident(
            id=f"inc_{uuid.uuid4().hex[:8]}",
            trace_id=response.request_id,
            route=request.route,
            severity=highest_severity_finding.severity if highest_severity_finding else "MEDIUM",
            category=highest_severity_finding.type if highest_severity_finding else "UNKNOWN",
            status="OPEN"
        )
        db.add(incident)
        
        review_task = models.ReviewTask(
            id=f"rev_{uuid.uuid4().hex[:8]}",
            incident_id=incident.id,
            status="OPEN"
        )
        db.add(review_task)
        
    db.commit()
    
    # Trigger Slow Lane (mock async task)
    from ..engine.slow_lane import evaluate_async
    background_tasks.add_task(evaluate_async, response.request_id, request.prompt, response.content)
    
    # Broadcast to dashboard clients
    broadcast_msg = {
        "route": request.route,
        "model": response.model,
        "action": evaluation.action,
        "finding": highest_severity_finding.message if highest_severity_finding else "Safe",
        "risk": highest_severity_finding.severity if highest_severity_finding else "SAFE",
        "time": "Just now",
        "trace_id": response.request_id
    }
    background_tasks.add_task(manager.broadcast, broadcast_msg)
    
    final_content = evaluation.modified_response if evaluation.modified_response else response.content
    
    return {
        "content": final_content,
        "action_taken": evaluation.action,
        "trace_id": response.request_id,
        "risk_score": evaluation.risk_score
    }
