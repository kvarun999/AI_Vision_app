from sqlalchemy import Column, String, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
import uuid
from .base import Base

class MediaAsset(Base):
    __tablename__ = "media_assets"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    s3_key = Column(String, nullable=False)
    s3_url = Column(String, nullable=False)
    media_type = Column(String, nullable=False)
    origin = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
