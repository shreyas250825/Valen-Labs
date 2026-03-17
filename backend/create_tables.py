# backend/create_tables.py
from app.database import engine, Base
from app.models import user, interview, response, report, resume

def create_tables():
    """Create all database tables"""
    Base.metadata.create_all(bind=engine)
    print("Database tables created successfully!")

if __name__ == "__main__":
    create_tables()