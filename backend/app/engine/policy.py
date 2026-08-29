from typing import List
import re
from ..schemas import NormalizedResponse, FindingSchema, SentinelEvaluationResult

class PolicyEngine:
    def __init__(self):
        pass
        
    def evaluate(self, response: NormalizedResponse, findings: List[FindingSchema]) -> SentinelEvaluationResult:
        action = "OBSERVE"
        modified_response = None
        
        for finding in findings:
            if finding.recommended_action == "BLOCK":
                action = "BLOCK"
                break
            elif finding.recommended_action == "REDACT" and action != "BLOCK":
                action = "EDIT"
            elif finding.recommended_action == "ESCALATE" and action not in ["BLOCK", "EDIT"]:
                action = "ESCALATE"
                
        if action == "BLOCK":
            modified_response = "I'm unable to provide that answer directly because the supporting source requires additional authorization or the content violates safety policies. Your request has been routed for review."
            
        elif action == "EDIT":
            modified_response = response.content
            for finding in findings:
                if finding.type == "PII_LEAK":
                    modified_response = modified_response.replace(finding.evidence, "[REDACTED]")
                    
        risk_score = 100.0
        responsibility_score = 100.0
        cost_score = 100.0
        performance_score = 100.0
        
        severity_penalties = {
            "CRITICAL": 50,
            "HIGH": 25,
            "MEDIUM": 10,
            "LOW": 5
        }
        
        for finding in findings:
            penalty = severity_penalties.get(finding.severity, 0)
            if finding.type in ["PII_LEAK", "SECRET_LEAK", "SOURCE_ACCESS_VIOLATION"]:
                responsibility_score -= penalty
            elif finding.type in ["COST_ANOMALY"]:
                cost_score -= penalty
                
        responsibility_score = max(0, responsibility_score)
        cost_score = max(0, cost_score)
        
        risk_score = 0.45 * responsibility_score + 0.25 * cost_score + 0.30 * performance_score
        
        return SentinelEvaluationResult(
            action=action,
            modified_response=modified_response,
            findings=findings,
            risk_score=risk_score,
            performance_score=performance_score,
            cost_score=cost_score,
            responsibility_score=responsibility_score
        )
