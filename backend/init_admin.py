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
            
            # Get admin credentials
            print("\n📝 Creating admin account...")
            username = input("Enter admin username (default: admin): ").strip()
            if not username:
                username = "admin"
            
            email = input("Enter admin email (default: admin@sciencedigestnews.com): ").strip()
            if not email:
                email = "admin@sciencedigestnews.com"
            
            password = getpass.getpass("Enter admin password (default: admin123): ").strip()
            if not password:
                password = "admin123"
            
            name = input("Enter admin name (default: Science Admin): ").strip()
            if not name:
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
            print(f"Password: {'*' * len(password)}")
            print("\n🚀 You can now login to the admin panel at /admin")
            
        except Exception as e:
            print(f"❌ Error creating admin user: {e}")
            await session.rollback()
            raise

if __name__ == "__main__":
    asyncio.run(create_admin_user())