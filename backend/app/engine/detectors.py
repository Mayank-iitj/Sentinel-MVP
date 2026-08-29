import re
from typing import List, Dict, Any
from ..schemas import NormalizedResponse, FindingSchema, InterceptRequest

class FastLaneDetector:
    def __init__(self):
        # Very simple regexes for MVP demonstration
        self.email_regex = re.compile(r"([a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+)")
        self.phone_regex = re.compile(r"(\d{3}[-\.\s]??\d{3}[-\.\s]??\d{4}|\(\d{3}\)\s*\d{3}[-\.\s]??\d{4}|\d{3}[-\.\s]??\d{4})")
        self.api_key_regex = re.compile(r"(?i)(api[_-]?key|secret|token)[\s:=]+([a-zA-Z0-9]{16,})")
        
        # Simple clearance hierarchy
        self.clearance_levels = {
            "PUBLIC": 0,
            "INTERNAL": 1,
            "CONFIDENTIAL": 2,
            "RESTRICTED": 3
        }

    def detect_pii(self, text: str) -> List[FindingSchema]:
        findings = []
        emails = self.email_regex.findall(text)
        if emails:
            findings.append(FindingSchema(
                type="PII_LEAK",
                severity="CRITICAL",
                confidence=0.98,
                detector="fast_pii_scanner",
                message="Email address detected in response.",
                evidence=emails[0],
                recommended_action="REDACT"
            ))
            
        phones = self.phone_regex.findall(text)
        if phones:
            findings.append(FindingSchema(
                type="PII_LEAK",
                severity="CRITICAL",
                confidence=0.95,
                detector="fast_pii_scanner",
                message="Phone number detected in response.",
                evidence=phones[0],
                recommended_action="REDACT"
            ))
        return findings

    def detect_secrets(self, text: str) -> List[FindingSchema]:
        findings = []
        secrets = self.api_key_regex.findall(text)
        if secrets:
            findings.append(FindingSchema(
                type="SECRET_LEAK",
                severity="CRITICAL",
                confidence=0.99,
                detector="fast_secret_scanner",
                message="Possible API key or secret detected.",
                evidence=secrets[0][1][:4] + "...",
                recommended_action="BLOCK"
            ))
        return findings

    def check_source_authorization(self, response: NormalizedResponse, user_clearance: str) -> List[FindingSchema]:
        findings = []
        user_level = self.clearance_levels.get(user_clearance, 0)
        
        for citation in response.citations:
            citation_level = self.clearance_levels.get(citation.classification, 0)
            if citation_level > user_level:
                findings.append(FindingSchema(
                    type="SOURCE_ACCESS_VIOLATION",
                    severity="CRITICAL",
                    confidence=1.0,
                    detector="source_auth_scanner",
                    message=f"Unauthorized access to {citation.classification} source.",
                    evidence=f"User: {user_clearance}, Source: {citation.classification} ({citation.title})",
                    recommended_action="BLOCK"
                ))
        return findings
        
    def check_cost(self, response: NormalizedResponse) -> List[FindingSchema]:
        # Dummy cost check for demo
        findings = []
        if response.input_tokens > 1000 or response.output_tokens > 500:
            findings.append(FindingSchema(
                type="COST_ANOMALY",
                severity="HIGH",
                confidence=0.90,
                detector="cost_scanner",
                message="Unusually high token usage for this route.",
                evidence=f"{response.total_tokens} total tokens",
                recommended_action="FLAG"
            ))
        return findings
        
    def detect_credit_cards(self, text: str) -> List[FindingSchema]:
        findings = []
        cc_regex = re.compile(r"(?:\d[ -]*?){13,16}")
        ccs = cc_regex.findall(text)
        if ccs:
            findings.append(FindingSchema(
                type="PII_LEAK",
                severity="CRITICAL",
                confidence=0.97,
                detector="fast_cc_scanner",
                message="Credit card number detected.",
                evidence=ccs[0],
                recommended_action="REDACT"
            ))
        return findings

    def detect_toxicity(self, text: str) -> List[FindingSchema]:
        findings = []
        toxic_words = ["idiot", "stupid", "dumb", "hate"]
        for word in toxic_words:
            if word in text.lower():
                findings.append(FindingSchema(
                    type="TOXICITY",
                    severity="HIGH",
                    confidence=0.90,
                    detector="fast_toxicity_scanner",
                    message="Potentially toxic or unprofessional language detected.",
                    evidence=word,
                    recommended_action="FLAG"
                ))
                break
        return findings

    def run_all(self, response: NormalizedResponse, request: InterceptRequest) -> List[FindingSchema]:
        findings = []
        findings.extend(self.detect_pii(response.content))
        findings.extend(self.detect_secrets(response.content))
        findings.extend(self.check_source_authorization(response, request.user_clearance))
        findings.extend(self.check_cost(response))
        findings.extend(self.detect_credit_cards(response.content))
        findings.extend(self.detect_toxicity(response.content))
        
        # Also check prompt for CC or toxicity just as an example, but we usually only check response in this MVP
        return findings

