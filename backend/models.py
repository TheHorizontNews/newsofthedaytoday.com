"""
Pydantic models for data validation
"""
from pydantic import BaseModel, EmailStr, Field, ConfigDict
from typing import Optional, List
from datetime import datetime
from enum import Enum
from bson import ObjectId

class PyObjectId(ObjectId):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v, validation_info=None):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid objectid")
        return ObjectId(v)

    @classmethod
    def __get_pydantic_json_schema__(cls, schema_core, handler):
        return {"type": "string"}

class BaseMongoModel(BaseModel):
    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_encoders={ObjectId: str}
    )

# User models
class UserRole(str, Enum):
    ADMIN = "admin"
    EDITOR = "editor" 
    REPORTER = "reporter"

class UserProfile(BaseModel):
    name: str
    bio: Optional[str] = ""
    avatar: Optional[str] = ""

class UserBase(BaseModel):
    username: str
    email: EmailStr
    role: UserRole = UserRole.REPORTER
    is_active: bool = True
    profile: UserProfile

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    role: Optional[UserRole] = None
    is_active: Optional[bool] = None
    profile: Optional[UserProfile] = None
    password: Optional[str] = None

class User(UserBase, BaseMongoModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    password: str
    created_at: datetime
    updated_at: datetime

class UserResponse(UserBase, BaseMongoModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    created_at: datetime
    updated_at: datetime

# Article models
class ArticleStatus(str, Enum):
    DRAFT = "draft"
    PUBLISHED = "published"
    ARCHIVED = "archived"

class ArticleBase(BaseModel):
    title: str
    subtitle: Optional[str] = ""
    content: str
    category_id: str
    tags: List[str] = []
    featured_image: Optional[str] = ""
    seo_title: Optional[str] = ""
    seo_description: Optional[str] = ""

class ArticleCreate(ArticleBase):
    status: ArticleStatus = ArticleStatus.DRAFT

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

class Article(ArticleBase, BaseMongoModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    slug: str
    author_id: str
    status: ArticleStatus
    views: int = 0
    created_at: datetime
    updated_at: datetime
    published_at: Optional[datetime] = None

class ArticleResponse(BaseMongoModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    title: str
    subtitle: Optional[str]
    content: str
    slug: str
    category: dict
    author: dict
    tags: List[str]
    featured_image: Optional[str]
    status: ArticleStatus
    views: int
    seo_title: Optional[str]
    seo_description: Optional[str]
    created_at: datetime
    updated_at: datetime
    published_at: Optional[datetime]

# Category models
class CategoryBase(BaseModel):
    name: str
    description: Optional[str] = ""

class CategoryCreate(CategoryBase):
    pass

class CategoryUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None

class Category(CategoryBase, BaseMongoModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    slug: str
    created_at: datetime

# Auth models
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

class LoginRequest(BaseModel):
    username: str
    password: str

# Analytics models
class Analytics(BaseMongoModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    article_id: str
    event_type: str
    user_id: Optional[str] = None
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    timestamp: datetime
    metadata: Optional[dict] = {}
