from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from datetime import datetime

class Citation(BaseModel):
    source_id: str
    document_id: str
    title: str
    classification: str
    owner: str
    allowed_roles: List[str]
    allowed_users: List[str]
    sensitivity: str

class NormalizedResponse(BaseModel):
    request_id: str
    provider: str
    model: str
    input_tokens: int = 0
    output_tokens: int = 0
    total_tokens: int = 0
    latency_ms: int = 0
    content: str
    citations: List[Citation] = []
    metadata: Dict[str, Any] = {}

class InterceptRequest(BaseModel):
    application: str
    route: str
    user_id: str
    user_clearance: str = "PUBLIC"
    prompt: str
    provider: str = "mock"
    model: str = "gpt-style-premium"
    cohort: Optional[str] = None
    simulate_scenario: Optional[str] = None

class FindingSchema(BaseModel):
    type: str
    severity: str
    confidence: float
    detector: str
    message: str
    evidence: str
    recommended_action: str

class SentinelEvaluationResult(BaseModel):
    action: str # OBSERVE, EDIT, ESCALATE, BLOCK
    modified_response: Optional[str] = None
    findings: List[FindingSchema] = []
    risk_score: float = 0.0
    performance_score: float = 100.0
    cost_score: float = 100.0
    responsibility_score: float = 100.0
