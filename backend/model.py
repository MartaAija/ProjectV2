from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from database import Base, engine  # Import Base and engine from database.py
from datetime import datetime

# Define the User model with columns for storing credentials
class User(Base):
    __tablename__ = 'users'

    id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String, index=True)
    last_name = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    username = Column(String, unique=True, index=True)
    password = Column(String)
    company = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationship to saved attacks
    saved_attacks = relationship("SavedAttack", back_populates="user")

    def __repr__(self):
        return f"<User(username={self.username}, email={self.email})>"

# Define the SavedAttack model for storing attack history
class SavedAttack(Base):
    __tablename__ = 'saved_attacks'

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'))
    timestamp = Column(String)
    saved_at = Column(DateTime, default=datetime.utcnow)
    attack_type = Column(String)
    flow_bytes = Column(Float)
    confidence = Column(Float)
    recommendation = Column(String)
    interpretation = Column(String)
    feature_importance = Column(JSON)
    source_ip = Column(String)
    destination_ip = Column(String)
    protocol = Column(String)
    source_port = Column(Integer)
    destination_port = Column(Integer)
    flow_duration = Column(Integer)

    # Relationship to user
    user = relationship("User", back_populates="saved_attacks")

    def __repr__(self):
        return f"<SavedAttack(type={self.attack_type}, user_id={self.user_id})>"

    def to_dict(self):
        return {
            'id': self.id,
            'timestamp': self.timestamp,
            'savedAt': self.saved_at.isoformat(),
            'attackType': self.attack_type,
            'flowBytes': self.flow_bytes,
            'confidence': self.confidence,
            'recommendation': self.recommendation,
            'interpretation': self.interpretation,
            'featureImportance': self.feature_importance,
            'sourceIP': self.source_ip,
            'destinationIP': self.destination_ip,
            'protocol': self.protocol,
            'sourcePort': self.source_port,
            'destinationPort': self.destination_port,
            'flowDuration': self.flow_duration
        }

#Base.metadata.drop_all(engine)  # Drops all tables
#Base.metadata.create_all(engine)  # Creates all tables with new schema

