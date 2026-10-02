from sqlalchemy import Column, Text, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from .base import Base
import uuid

class GenerationLog(Base):
    __tablename__ = "generation_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    generated_asset_id = Column(UUID(as_uuid=True), ForeignKey("media_assets.id"))
    prompt = Column(Text, nullable=False)
    model_used = Column(Text, nullable=False)
