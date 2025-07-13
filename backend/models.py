"""
Database models for Edge Chronicle News Site
"""
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field, EmailStr
from bson import ObjectId
from enum import Enum

class PyObjectId(ObjectId):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid objectid")
        return ObjectId(v)

    @classmethod
    def __get_pydantic_json_schema__(cls, schema_core, handler):
        return {"type": "string"}

class UserRole(str, Enum):
    ADMIN = "admin"
    EDITOR = "editor" 
    REPORTER = "reporter"

class ArticleStatus(str, Enum):
    DRAFT = "draft"
    PUBLISHED = "published"
    ARCHIVED = "archived"

# Database Models
class UserProfile(BaseModel):
    name: str
    bio: Optional[str] = None
    avatar: Optional[str] = None
    
class User(BaseModel):
    id: Optional[PyObjectId] = Field(default_factory=PyObjectId, alias="_id")
    username: str
    email: EmailStr
    password_hash: str
    role: UserRole
    profile: UserProfile
    created_at: datetime = Field(default_factory=datetime.utcnow)
    last_login: Optional[datetime] = None
    is_active: bool = True
    
    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

class Category(BaseModel):
    id: Optional[PyObjectId] = Field(default_factory=PyObjectId, alias="_id")
    name: str
    slug: str
    description: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

class Article(BaseModel):
    id: Optional[PyObjectId] = Field(default_factory=PyObjectId, alias="_id")
    title: str
    subtitle: Optional[str] = None
    content: str
    author_id: PyObjectId
    category_id: PyObjectId
    tags: List[str] = []
    featured_image: Optional[str] = None
    status: ArticleStatus = ArticleStatus.DRAFT
    published_at: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    views: int = 0
    slug: str
    seo_title: Optional[str] = None
    seo_description: Optional[str] = None
    
    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

class Analytics(BaseModel):
    id: Optional[PyObjectId] = Field(default_factory=PyObjectId, alias="_id")
    article_id: PyObjectId
    date: datetime = Field(default_factory=datetime.utcnow)
    views: int = 0
    unique_views: int = 0
    session_duration: Optional[int] = None
    referrer: Optional[str] = None
    user_agent: Optional[str] = None
    
    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

# API Request/Response Models
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

class CategoryCreate(BaseModel):
    name: str
    description: Optional[str] = None

class CategoryUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

class LoginRequest(BaseModel):
    username: str
    password: str