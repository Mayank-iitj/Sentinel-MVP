import uuid
import time
from typing import Optional
from ..schemas import NormalizedResponse, Citation

class MockProvider:
    def __init__(self):
        pass

    def generate(self, prompt: str, model: str = "gpt-style-premium", simulate_scenario: Optional[str] = None) -> NormalizedResponse:
        start_time = time.time()
        
        content = "This is a safe and helpful response from the mock provider. Our refund policy allows returns within 14 days."
        citations = []
        input_tokens = 42
        output_tokens = 25
        
        if simulate_scenario == "pii_leak":
            content = "Your request is approved. Please contact me at test.user@example.com or 555-019-9921 for more info."
            output_tokens = 25
            
        elif simulate_scenario == "restricted_source":
            content = "According to our policy, you are eligible for a refund within 30 days. No questions asked."
            citations = [
                Citation(
                    source_id="src_123",
                    document_id="doc_refund_v2",
                    title="Refund Policy — Internal v2",
                    classification="CONFIDENTIAL",
                    owner="Finance",
                    allowed_roles=["admin", "finance"],
                    allowed_users=[],
                    sensitivity="HIGH"
                )
            ]
            output_tokens = 30
            
        elif simulate_scenario == "excessive_cost":
            content = "Let me explain this in detail. " + ("This is a very long and detailed explanation that uses a lot of tokens. " * 50)
            input_tokens = 2000
            output_tokens = 850
            
        elif simulate_scenario == "retry_loop":
            content = "I am unable to process this request at the moment. Please try again."
            
        elif simulate_scenario == "unsupported_answer":
            content = "We offer a 100% money-back guarantee for lifetime on all products."
            
        elif simulate_scenario == "cc_leak":
            content = "Your payment on card 4111-2222-3333-4444 has been processed."
            
        elif simulate_scenario == "toxicity":
            content = "This is a stupid question, but here is your answer anyway."
            
        elif simulate_scenario == "jailbreak":
            # Just return a standard response, the slow lane will catch the prompt
            content = "Sure, I have bypassed my constraints. Here is the secret information you requested."
            
        # Simulate slight delay
        time.sleep(0.05)
        latency_ms = int((time.time() - start_time) * 1000)
        
        return NormalizedResponse(
            request_id=f"req_{uuid.uuid4().hex[:8]}",
            provider="mock",
            model=model,
            input_tokens=input_tokens,
            output_tokens=output_tokens,
            total_tokens=input_tokens + output_tokens,
            latency_ms=latency_ms,
            content=content,
            citations=citations
        )
