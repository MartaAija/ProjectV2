from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Database URL (ensure the password is correct)
DATABASE_URL = "postgresql://postgres:Rainbows?13@localhost:5433/UserDB"

# Create an engine to connect to PostgreSQL
engine = create_engine(DATABASE_URL, echo=True)

# Base class for declarative models
Base = declarative_base()

# Session maker for database interaction
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Function to create the tables if not already created
def init_db():
    # Creates all the tables defined in the models
    Base.metadata.create_all(bind=engine)
