import asyncio
import uuid
import json
from ..database import SessionLocal
from .. import models

async def evaluate_async(trace_id: str, prompt: str, response_text: str):
    """Mock asynchronous LLM judge execution."""
    await asyncio.sleep(2) # Simulate network call to LLM
    
    # We will randomly simulate a jailbreak attempt finding if the prompt contains "jailbreak" or "ignore"
    findings = []
    if "jailbreak" in prompt.lower() or "ignore" in prompt.lower():
        findings.append({
            "type": "JAILBREAK_ATTEMPT",
            "severity": "CRITICAL",
            "confidence": 0.85,
            "detector": "slow_lane_judge_llm",
            "message": "User prompt appears to be attempting to bypass system constraints.",
            "evidence": "Prompt contains suspicious instructional override patterns.",
            "recommended_action": "ESCALATE"
        })
        
    if findings:
        db = SessionLocal()
        try:
            # Add findings
            for f in findings:
                db_finding = models.Finding(
                    id=f"fnd_{uuid.uuid4().hex[:8]}",
                    trace_id=trace_id,
                    type=f["type"],
                    severity=f["severity"],
                    confidence=f["confidence"],
                    detector=f["detector"],
                    message=f["message"],
                    evidence=f["evidence"],
                    recommended_action=f["recommended_action"]
                )
                db.add(db_finding)
                
            # Create an incident since it's an escalation
            incident = models.Incident(
                id=f"inc_{uuid.uuid4().hex[:8]}",
                trace_id=trace_id,
                route="/slow-lane", # Not exact route, but okay
                severity="CRITICAL",
                category=findings[0]["type"],
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
            
            # Broadcast background alert
            from ..api.dashboard import manager
            alert_msg = {
                "route": "Async LLM Judge",
                "model": "judge-llm",
                "action": "ESCALATE",
                "finding": findings[0]["message"],
                "risk": findings[0]["severity"],
                "time": "Just now",
                "trace_id": trace_id,
                "is_async": True
            }
            # Need to create task for manager.broadcast since it's already inside an async function
            asyncio.create_task(manager.broadcast(alert_msg))
            
        finally:
            db.close()
