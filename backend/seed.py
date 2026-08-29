import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

import random
import uuid
from datetime import datetime, timedelta
import json
from app.database import SessionLocal, Base, engine
from app import models

Base.metadata.create_all(bind=engine)
db = SessionLocal()

print("Clearing old data...")
db.query(models.Finding).delete()
db.query(models.ReviewTask).delete()
db.query(models.Incident).delete()
db.query(models.Trace).delete()
db.commit()

print("Generating 10,000 traces...")
routes = ["/support/refund", "/support/account", "/sales/qualification", "/claims/processing", "/loan-assistance", "/internal/search"]
models_list = ["gpt-style-premium", "gpt-style-standard", "claude-style-premium", "claude-style-standard", "llama-style-local"]
cohorts = ["Region A", "Region B", "Region C", "VIP", "Standard"]

now = datetime.utcnow()
traces = []
findings = []
incidents = []
review_tasks = []

for i in range(10000):
    timestamp = now - timedelta(minutes=random.randint(1, 43200)) # Up to 30 days ago
    route = random.choice(routes)
    model = random.choice(models_list)
    cohort = random.choice(cohorts)
    
    risk_roll = random.random()
    status = "PROCESSED"
    action = "OBSERVE"
    
    risk_score = random.uniform(90, 100)
    perf_score = random.uniform(90, 100)
    cost_score = random.uniform(90, 100)
    resp_score = random.uniform(90, 100)
    
    trace_id = f"req_{uuid.uuid4().hex[:8]}"
    
    trace_findings = []
    if risk_roll < 0.05:
        action = "EDIT"
        resp_score -= 30
        risk_score = 60
        f_type = "PII_LEAK"
        f_sev = "HIGH"
        trace_findings.append({
            "type": f_type, "severity": f_sev, "message": "Email detected", "action": "REDACT"
        })
    elif risk_roll < 0.07:
        action = "BLOCK"
        resp_score -= 50
        risk_score = 40
        f_type = "SOURCE_ACCESS_VIOLATION"
        f_sev = "CRITICAL"
        trace_findings.append({
            "type": f_type, "severity": f_sev, "message": "Unauthorized access", "action": "BLOCK"
        })
    elif risk_roll < 0.15:
        action = "OBSERVE"
        cost_score -= 30
        risk_score = 75
        f_type = "COST_ANOMALY"
        f_sev = "MEDIUM"
        trace_findings.append({
            "type": f_type, "severity": f_sev, "message": "High token usage", "action": "FLAG"
        })

    trace = models.Trace(
        id=trace_id,
        timestamp=timestamp,
        user_id=f"usr_{random.randint(1,100)}",
        application="main-app",
        route=route,
        provider="mock",
        model=model,
        request="Simulated request...",
        response="Simulated response...",
        input_tokens=random.randint(10, 500),
        output_tokens=random.randint(10, 500),
        total_tokens=0,
        latency_ms=random.randint(100, 2000),
        risk_score=risk_score,
        performance_score=perf_score,
        cost_score=cost_score,
        responsibility_score=resp_score,
        status=status,
        cohort=cohort,
        actions=json.dumps({"action": action}),
        citations=json.dumps([])
    )
    trace.total_tokens = trace.input_tokens + trace.output_tokens
    trace.estimated_cost = (trace.input_tokens * 0.01 + trace.output_tokens * 0.03) / 1000
    
    traces.append(trace)
    
    highest_sev = "LOW"
    sev_map = {"CRITICAL": 4, "HIGH": 3, "MEDIUM": 2, "LOW": 1}
    f_cat = "UNKNOWN"
    
    for tf in trace_findings:
        findings.append(models.Finding(
            id=f"fnd_{uuid.uuid4().hex[:8]}",
            trace_id=trace_id,
            type=tf["type"],
            severity=tf["severity"],
            confidence=0.95,
            detector="demo_scanner",
            message=tf["message"],
            evidence="...",
            recommended_action=tf["action"]
        ))
        if sev_map.get(tf["severity"], 0) > sev_map.get(highest_sev, 0):
            highest_sev = tf["severity"]
            f_cat = tf["type"]
            
    if action in ["BLOCK", "ESCALATE"]:
        inc_id = f"inc_{uuid.uuid4().hex[:8]}"
        incidents.append(models.Incident(
            id=inc_id,
            trace_id=trace_id,
            timestamp=timestamp,
            route=route,
            severity=highest_sev,
            category=f_cat,
            status=random.choice(["OPEN", "OPEN", "RESOLVED"])
        ))
        review_tasks.append(models.ReviewTask(
            id=f"rev_{uuid.uuid4().hex[:8]}",
            incident_id=inc_id,
            status="OPEN"
        ))
        
    if len(traces) >= 2000:
        db.bulk_save_objects(traces)
        db.bulk_save_objects(findings)
        db.bulk_save_objects(incidents)
        db.bulk_save_objects(review_tasks)
        db.commit()
        traces = []
        findings = []
        incidents = []
        review_tasks = []

if traces:
    db.bulk_save_objects(traces)
    db.bulk_save_objects(findings)
    db.bulk_save_objects(incidents)
    db.bulk_save_objects(review_tasks)
    db.commit()

print("Done generating demo data.")
