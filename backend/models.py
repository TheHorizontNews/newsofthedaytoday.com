"""
Database models for Science Digest News
"""
from datetime import datetime
from typing import Optional, List
from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ForeignKey, Enum as SQLEnum
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from pydantic import BaseModel, Field, EmailStr
from enum import Enum
import uuid

Base = declarative_base()

class UserRole(str, Enum):
    ADMIN = "admin"
    EDITOR = "editor" 
    REPORTER = "reporter"

class ArticleStatus(str, Enum):
    DRAFT = "draft"
    PUBLISHED = "published"
    ARCHIVED = "archived"

# SQLAlchemy Models (Database Tables)
class UserTable(Base):
    __tablename__ = "users"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    role = Column(SQLEnum(UserRole), nullable=False)
    name = Column(String, nullable=True)
    bio = Column(Text, nullable=True)
    avatar = Column(Text, nullable=True)  # base64 encoded
    created_at = Column(DateTime, default=datetime.utcnow)
    last_login = Column(DateTime, nullable=True)
    is_active = Column(Boolean, default=True)

    # Relationship
    articles = relationship("ArticleTable", back_populates="author")

class CategoryTable(Base):
    __tablename__ = "categories"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False)
    slug = Column(String, unique=True, index=True, nullable=False)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationship
    articles = relationship("ArticleTable", back_populates="category")

class ArticleTable(Base):
    __tablename__ = "articles"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    title = Column(String, nullable=False)
    subtitle = Column(String, nullable=True)
    content = Column(Text, nullable=False)
    author_id = Column(String, ForeignKey("users.id"), nullable=False)
    category_id = Column(String, ForeignKey("categories.id"), nullable=False)
    tags = Column(Text, nullable=True)  # JSON string
    featured_image = Column(Text, nullable=True)  # base64 encoded
    status = Column(SQLEnum(ArticleStatus), default=ArticleStatus.DRAFT)
    published_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    views = Column(Integer, default=0)
    slug = Column(String, unique=True, index=True, nullable=False)
    seo_title = Column(String, nullable=True)
    seo_description = Column(Text, nullable=True)
    
    # Relationships
    author = relationship("UserTable", back_populates="articles")
    category = relationship("CategoryTable", back_populates="articles")

class AnalyticsTable(Base):
    __tablename__ = "analytics"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    article_id = Column(String, ForeignKey("articles.id"), nullable=False)
    date = Column(DateTime, default=datetime.utcnow)
    views = Column(Integer, default=0)
    unique_views = Column(Integer, default=0)
    session_duration = Column(Integer, nullable=True)
    referrer = Column(String, nullable=True)
    user_agent = Column(String, nullable=True)

# Pydantic Models (API Request/Response)
class UserProfile(BaseModel):
    name: str
    bio: Optional[str] = None
    avatar: Optional[str] = None
    
class User(BaseModel):
    id: str
    username: str
    email: EmailStr
    role: UserRole
    profile: UserProfile
    created_at: datetime
    last_login: Optional[datetime] = None
    is_active: bool = True
    
    class Config:
        from_attributes = True

class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str
    role: UserRole
    profile: UserProfile

class UserUpdate(BaseModel):
    username: Optional[str] = None
    email: Optional[EmailStr] = None
    role: Optional[UserRole] = None
    profile: Optional[UserProfile] = None
    is_active: Optional[bool] = None

class UserResponse(BaseModel):
    id: str
    username: str
    email: str
    role: UserRole
    profile: UserProfile
    created_at: datetime
    last_login: Optional[datetime]
    is_active: bool
    
    class Config:
        from_attributes = True

class Category(BaseModel):
    id: str
    name: str
    slug: str
    description: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True

class CategoryCreate(BaseModel):
    name: str
    description: Optional[str] = None

class CategoryUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None

class ArticleCreate(BaseModel):
    title: str
    subtitle: Optional[str] = None
    content: str
    category_id: str
    tags: List[str] = []
    featured_image: Optional[str] = None
    status: ArticleStatus = ArticleStatus.DRAFT
    seo_title: Optional[str] = None
    seo_description: Optional[str] = None

class ArticleUpdate(BaseModel):
    title: Optional[str] = None
    subtitle: Optional[str] = None
    content: Optional[str] = None
    category_id: Optional[str] = None
    tags: Optional[List[str]] = None
    featured_image: Optional[str] = None
    status: Optional[ArticleStatus] = None
    seo_title: Optional[str] = None
    seo_description: Optional[str] = None

class ArticleResponse(BaseModel):
    id: str
    title: str
    subtitle: Optional[str]
    content: str
    author: UserResponse
    category: Category
    tags: List[str]
    featured_image: Optional[str]
    status: ArticleStatus
    published_at: Optional[datetime]
    created_at: datetime
    updated_at: datetime
    views: int
    slug: str
    seo_title: Optional[str]
    seo_description: Optional[str]
    
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

class LoginRequest(BaseModel):
    username: str
    password: str