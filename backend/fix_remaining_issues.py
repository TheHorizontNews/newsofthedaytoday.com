#!/usr/bin/env python3
"""
Fix remaining admin panel issues
"""
import sys
import asyncio
from datetime import datetime

print("🔧 Creating test article...")

# Mock article data for testing
test_article = {
    "title": "Revolutionary AI Breakthrough in Quantum Computing",
    "subtitle": "Scientists develop first quantum-AI hybrid processor",
    "content": "<h2>Scientific Breakthrough</h2><p>Researchers at the Institute of Science have successfully created the world's first quantum-AI hybrid processor, marking a significant milestone in computational science.</p><p>This revolutionary technology combines quantum computing principles with artificial intelligence algorithms to solve complex scientific problems that were previously impossible.</p><h3>Key Features:</h3><ul><li>1000x faster processing speed</li><li>Advanced problem-solving capabilities</li><li>Integration with existing systems</li></ul>",
    "category_id": "8f8284e0-dc51-4788-93c0-a56f3fcd3f1c",  # AI & Computing
    "tags": ["AI", "Quantum Computing", "Technology", "Research", "Innovation"],
    "featured_image": "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNjAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0iIzBjNjFjZiIvPjx0ZXh0IHg9IjMwMCIgeT0iMjEwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSJ3aGl0ZSIgZm9udC1zaXplPSIyNHB4IiBmb250LWZhbWlseT0iQXJpYWwiPkFJICYgUXVhbnR1bSBDb21wdXRpbmc8L3RleHQ+PC9zdmc+",
    "status": "published",
    "seo_title": "AI Quantum Computing Breakthrough 2025",
    "seo_description": "Revolutionary AI-Quantum hybrid processor developed by scientists offers 1000x faster computing for complex scientific problems."
}

async def create_test_article():
    """Create test article via API"""
    import aiohttp
    import json
    
    async with aiohttp.ClientSession() as session:
        try:
            # Login first
            login_data = {"username": "admin", "password": "admin123"}
            async with session.post("http://localhost:8001/api/auth/login", json=login_data) as login_resp:
                if login_resp.status != 200:
                    print(f"❌ Login failed: {login_resp.status}")
                    return
                
                login_result = await login_resp.json()
                token = login_result["access_token"]
                
            # Create article
            headers = {"Authorization": f"Bearer {token}"}
            async with session.post("http://localhost:8001/api/articles/", json=test_article, headers=headers) as resp:
                if resp.status == 200:
                    result = await resp.json()
                    print(f"✅ Test article created: {result['title']}")
                    print(f"   ID: {result['id']}")
                else:
                    error_text = await resp.text()
                    print(f"❌ Failed to create article: {resp.status}")
                    print(f"   Error: {error_text}")
                    
        except Exception as e:
            print(f"❌ Error: {e}")

if __name__ == "__main__":
    asyncio.run(create_test_article())