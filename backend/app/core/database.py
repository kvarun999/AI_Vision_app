from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

load_dotenv()

SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL")

# Handle the common case where Render/Neon/Supabase use 'postgres://' 
# but SQLAlchemy requires 'postgresql://'
if SQLALCHEMY_DATABASE_URL and SQLALCHEMY_DATABASE_URL.startswith("postgres://"):
    SQLALCHEMY_DATABASE_URL = SQLALCHEMY_DATABASE_URL.replace("postgres://", "postgresql://", 1)

if not SQLALCHEMY_DATABASE_URL:
    raise RuntimeError("DATABASE_URL is not set")

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    # 1. pool_pre_ping=True: The critical fix. Checks connection health before use.
    pool_pre_ping=True, 
    # 2. pool_recycle=1800: Recycles connections every 30 mins to prevent stale ones.
    pool_recycle=1800,
    # 3. pool_size=10: Maintains a pool of connections.
    pool_size=10,
    # 4. max_overflow=20: Allows temporary extra connections during load spikes.
    max_overflow=20
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()