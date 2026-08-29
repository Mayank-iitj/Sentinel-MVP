from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, Float, DateTime, JSON
from sqlalchemy.orm import relationship
import datetime
from .database import Base

class Trace(Base):
    __tablename__ = "traces"

    id = Column(String, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow, index=True)
    user_id = Column(String, index=True)
    application = Column(String, index=True)
    route = Column(String, index=True)
    provider = Column(String, index=True)
    model = Column(String, index=True)
    request = Column(String)
    response = Column(String)
    input_tokens = Column(Integer)
    output_tokens = Column(Integer)
    total_tokens = Column(Integer)
    estimated_cost = Column(Float)
    latency_ms = Column(Integer)
    risk_score = Column(Float)
    performance_score = Column(Float)
    cost_score = Column(Float)
    responsibility_score = Column(Float)
    status = Column(String)
    human_verdict = Column(String, nullable=True)
    cohort = Column(String, nullable=True)
    actions = Column(JSON, nullable=True)
    citations = Column(JSON, nullable=True)

    findings = relationship("Finding", back_populates="trace")
    incidents = relationship("Incident", back_populates="trace")


class Finding(Base):
    __tablename__ = "findings"

    id = Column(String, primary_key=True, index=True)
    trace_id = Column(String, ForeignKey("traces.id"), index=True)
    type = Column(String, index=True)
    severity = Column(String, index=True)
    confidence = Column(Float)
    detector = Column(String)
    message = Column(String)
    evidence = Column(String)
    recommended_action = Column(String)

    trace = relationship("Trace", back_populates="findings")


class Incident(Base):
    __tablename__ = "incidents"

    id = Column(String, primary_key=True, index=True)
    trace_id = Column(String, ForeignKey("traces.id"), index=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow, index=True)
    route = Column(String, index=True)
    severity = Column(String, index=True)
    category = Column(String, index=True)
    status = Column(String, index=True)
    assigned_reviewer = Column(String, nullable=True)

    trace = relationship("Trace", back_populates="incidents")
    review_tasks = relationship("ReviewTask", back_populates="incident")


class ReviewTask(Base):
    __tablename__ = "review_tasks"

    id = Column(String, primary_key=True, index=True)
    incident_id = Column(String, ForeignKey("incidents.id"), index=True)
    status = Column(String, index=True)
    reviewer_notes = Column(String, nullable=True)

    incident = relationship("Incident", back_populates="review_tasks")


class Policy(Base):
    __tablename__ = "policies"

    id = Column(String, primary_key=True, index=True)
    name = Column(String)
    description = Column(String)
    condition = Column(JSON)
    action = Column(String)
    active = Column(Boolean, default=True)

class ModelPricing(Base):
    __tablename__ = "model_pricing"

    id = Column(String, primary_key=True, index=True)
    provider = Column(String, index=True)
    model = Column(String, index=True)
    input_price_per_1k = Column(Float)
    output_price_per_1k = Column(Float)
