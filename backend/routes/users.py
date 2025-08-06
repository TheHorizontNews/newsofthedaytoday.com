"""
User management routes for SQLite
"""
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from auth import get_current_active_user, require_admin, get_password_hash
from database import get_db
from models import UserTable, UserCreate, UserUpdate, UserResponse, UserRole, UserProfile

router = APIRouter(prefix="/api/users", tags=["users"])

@router.get("/", response_model=List[UserResponse])
async def get_users(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    role: Optional[UserRole] = None,
    search: Optional[str] = None,
    current_user: UserTable = Depends(require_admin()),
    db: AsyncSession = Depends(get_db)
):
    """Get users with pagination and filtering"""
    query = select(UserTable)
    
    if role:
        query = query.where(UserTable.role == role)
    
    if search:
        query = query.where(
            UserTable.username.contains(search) |
            UserTable.email.contains(search) |
            UserTable.name.contains(search)
        )
    
    query = query.order_by(UserTable.created_at.desc()).offset(skip).limit(limit)
    
    result = await db.execute(query)
    users = result.scalars().all()
    
    # Format responses
    response_users = []
    for user in users:
        profile = UserProfile(
            name=user.name or "",
            bio=user.bio,
            avatar=user.avatar
        )
        
        response_users.append(UserResponse(
            id=user.id,
            username=user.username,
            email=user.email,
            role=user.role,
            profile=profile,
            created_at=user.created_at,
            last_login=user.last_login,
            is_active=user.is_active
        ))
    
    return response_users

@router.get("/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: str,
    current_user: UserTable = Depends(require_admin()),
    db: AsyncSession = Depends(get_db)
):
    """Get single user by ID"""
    result = await db.execute(select(UserTable).where(UserTable.id == user_id))
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    profile = UserProfile(
        name=user.name or "",
        bio=user.bio,
        avatar=user.avatar
    )
    
    return UserResponse(
        id=user.id,
        username=user.username,
        email=user.email,
        role=user.role,
        profile=profile,
        created_at=user.created_at,
        last_login=user.last_login,
        is_active=user.is_active
    )

@router.post("/", response_model=UserResponse)
async def create_user(
    user_data: UserCreate,
    current_user: UserTable = Depends(require_admin()),
    db: AsyncSession = Depends(get_db)
):
    """Create new user"""
    # Check if username or email already exists
    result = await db.execute(
        select(UserTable).where(
            (UserTable.username == user_data.username) |
            (UserTable.email == user_data.email)
        )
    )
    existing_user = result.scalar_one_or_none()
    
    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Username or email already exists"
        )
    
    # Create user
    user = UserTable(
        username=user_data.username,
        email=user_data.email,
        password_hash=get_password_hash(user_data.password),
        role=user_data.role,
        name=user_data.profile.name,
        bio=user_data.profile.bio,
        avatar=user_data.profile.avatar,
        is_active=True
    )
    
    db.add(user)
    await db.commit()
    await db.refresh(user)
    
    profile = UserProfile(
        name=user.name or "",
        bio=user.bio,
        avatar=user.avatar
    )
    
    return UserResponse(
        id=user.id,
        username=user.username,
        email=user.email,
        role=user.role,
        profile=profile,
        created_at=user.created_at,
        last_login=user.last_login,
        is_active=user.is_active
    )

@router.put("/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: str,
    user_data: UserUpdate,
    current_user: UserTable = Depends(require_admin()),
    db: AsyncSession = Depends(get_db)
):
    """Update user"""
    result = await db.execute(select(UserTable).where(UserTable.id == user_id))
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Update fields
    if user_data.username is not None:
        # Check if username already exists
        result = await db.execute(
            select(UserTable).where(
                UserTable.username == user_data.username,
                UserTable.id != user_id
            )
        )
        if result.scalar_one_or_none():
            raise HTTPException(status_code=400, detail="Username already exists")
        user.username = user_data.username
    
    if user_data.email is not None:
        # Check if email already exists
        result = await db.execute(
            select(UserTable).where(
                UserTable.email == user_data.email,
                UserTable.id != user_id
            )
        )
        if result.scalar_one_or_none():
            raise HTTPException(status_code=400, detail="Email already exists")
        user.email = user_data.email
    
    if user_data.role is not None:
        user.role = user_data.role
    
    if user_data.profile is not None:
        user.name = user_data.profile.name
        user.bio = user_data.profile.bio
        user.avatar = user_data.profile.avatar
    
    if user_data.is_active is not None:
        user.is_active = user_data.is_active
    
    await db.commit()
    await db.refresh(user)
    
    profile = UserProfile(
        name=user.name or "",
        bio=user.bio,
        avatar=user.avatar
    )
    
    return UserResponse(
        id=user.id,
        username=user.username,
        email=user.email,
        role=user.role,
        profile=profile,
        created_at=user.created_at,
        last_login=user.last_login,
        is_active=user.is_active
    )

@router.delete("/{user_id}")
async def delete_user(
    user_id: str,
    current_user: UserTable = Depends(require_admin()),
    db: AsyncSession = Depends(get_db)
):
    """Delete user"""
    # Prevent self-deletion
    if current_user.id == user_id:
        raise HTTPException(status_code=400, detail="Cannot delete your own account")
    
    result = await db.execute(select(UserTable).where(UserTable.id == user_id))
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    await db.delete(user)
    await db.commit()
    
    return {"message": "User deleted successfully"}