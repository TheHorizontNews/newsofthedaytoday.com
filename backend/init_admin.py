#!/usr/bin/env python3
"""
Initialize Science Digest News admin account for SQLite
"""
import asyncio
import getpass
from sqlalchemy import select
from database import AsyncSessionLocal, init_db
from models import UserTable, UserRole
from auth import get_password_hash

async def create_admin_user():
    """Create admin user"""
    print("🔬 Science Digest News - Admin Setup")
    print("=" * 40)
    
    # Initialize database first
    await init_db()
    
    async with AsyncSessionLocal() as session:
        try:
            # Check if admin user already exists
            result = await session.execute(
                select(UserTable).where(UserTable.role == UserRole.ADMIN)
            )
            existing_admin = result.scalar_one_or_none()
            
            if existing_admin:
                print("✅ Admin user already exists!")
                print(f"Username: {existing_admin.username}")
                print(f"Email: {existing_admin.email}")
                return
            
            # Create default admin user for deployment
            print("\n📝 Creating default admin account...")
            username = "admin"
            email = "admin@sciencedigestnews.com"
            password = "admin123"
            name = "Science Admin"
            
            # Create admin user
            admin_user = UserTable(
                username=username,
                email=email,
                password_hash=get_password_hash(password),
                role=UserRole.ADMIN,
                name=name,
                bio="Administrator of Science Digest News",
                is_active=True
            )
            
            session.add(admin_user)
            await session.commit()
            
            print("\n🎉 Admin user created successfully!")
            print(f"Username: {username}")
            print(f"Email: {email}")
            print(f"Password: admin123")
            print("\n🚀 You can now login to the admin panel at /admin")
            
        except Exception as e:
            print(f"❌ Error creating admin user: {e}")
            await session.rollback()
            raise

if __name__ == "__main__":
    asyncio.run(create_admin_user())