#!/usr/bin/env python3
"""
Backend API Testing for Article Management Functionality
Tests all article CRUD operations and related endpoints
"""

import asyncio
import aiohttp
import json
from datetime import datetime
import os
import sys

# Get backend URL from environment
BACKEND_URL = os.getenv('REACT_APP_BACKEND_URL', 'https://8ca882a8-83c2-4c10-93ce-a296b7f160ab.preview.emergentagent.com')

class BackendTester:
    def __init__(self):
        self.session = None
        self.results = []
        self.auth_token = None
        self.test_article_id = None
        self.test_category_id = None
        
    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self
        
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    def log_result(self, test_name, success, details="", response_data=None):
        """Log test result"""
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}")
        if details:
            print(f"   Details: {details}")
        if response_data and not success:
            print(f"   Response: {response_data}")
        print()
        
        self.results.append({
            "test": test_name,
            "success": success,
            "details": details,
            "response": response_data
        })
    
    async def authenticate_admin(self):
        """Authenticate as admin user"""
        try:
            login_data = {
                "username": "admin",
                "password": "admin123"
            }
            
            async with self.session.post(f"{BACKEND_URL}/api/auth/login", json=login_data) as response:
                if response.status == 200:
                    data = await response.json()
                    self.auth_token = data.get("access_token")
                    if self.auth_token:
                        self.log_result("Admin Authentication", True, "Successfully authenticated as admin")
                        return True
                    else:
                        self.log_result("Admin Authentication", False, "No access token in response")
                        return False
                else:
                    error_data = await response.text()
                    self.log_result("Admin Authentication", False, f"HTTP {response.status}", error_data)
                    return False
        except Exception as e:
            self.log_result("Admin Authentication", False, f"Exception: {str(e)}")
            return False
    
    def get_auth_headers(self):
        """Get authorization headers"""
        if self.auth_token:
            return {"Authorization": f"Bearer {self.auth_token}"}
        return {}
    
    async def test_categories_admin_endpoint(self):
        """Test categories admin endpoint to get a valid category ID"""
        try:
            headers = self.get_auth_headers()
            async with self.session.get(f"{BACKEND_URL}/api/categories/admin", headers=headers) as response:
                if response.status == 200:
                    data = await response.json()
                    if data and len(data) > 0:
                        self.test_category_id = data[0]["id"]
                        self.log_result("Categories Admin Endpoint", True, f"Found {len(data)} categories, using category ID: {self.test_category_id}")
                        return True
                    else:
                        self.log_result("Categories Admin Endpoint", False, "No categories found")
                        return False
                else:
                    error_data = await response.text()
                    self.log_result("Categories Admin Endpoint", False, f"HTTP {response.status}", error_data)
                    return False
        except Exception as e:
            self.log_result("Categories Admin Endpoint", False, f"Exception: {str(e)}")
            return False
    
    async def test_articles_list_endpoint(self):
        """Test GET /api/articles/ - list all articles"""
        try:
            async with self.session.get(f"{BACKEND_URL}/api/articles/") as response:
                if response.status == 200:
                    data = await response.json()
                    self.log_result("Articles List Endpoint", True, f"Retrieved {len(data)} articles")
                    return True
                else:
                    error_data = await response.text()
                    self.log_result("Articles List Endpoint", False, f"HTTP {response.status}", error_data)
                    return False
        except Exception as e:
            self.log_result("Articles List Endpoint", False, f"Exception: {str(e)}")
            return False
    
    async def test_create_article(self):
        """Test POST /api/articles/ - create new article"""
        if not self.test_category_id:
            self.log_result("Create Article", False, "No valid category ID available")
            return False
            
        try:
            headers = self.get_auth_headers()
            headers["Content-Type"] = "application/json"
            
            article_data = {
                "title": "Test Article",
                "subtitle": "Test Subtitle",
                "content": "This is test content for the article.",
                "category_id": self.test_category_id,
                "tags": ["test", "article", "science"],
                "status": "draft",
                "seo_title": "Test SEO Title",
                "seo_description": "Test SEO description"
            }
            
            async with self.session.post(f"{BACKEND_URL}/api/articles/", json=article_data, headers=headers) as response:
                if response.status == 200:
                    data = await response.json()
                    self.test_article_id = data.get("id")
                    if self.test_article_id:
                        self.log_result("Create Article", True, f"Article created with ID: {self.test_article_id}")
                        return True
                    else:
                        self.log_result("Create Article", False, "No article ID in response")
                        return False
                else:
                    error_data = await response.text()
                    self.log_result("Create Article", False, f"HTTP {response.status}", error_data)
                    return False
        except Exception as e:
            self.log_result("Create Article", False, f"Exception: {str(e)}")
            return False
    
    async def test_get_specific_article(self):
        """Test GET /api/articles/{id} - get specific article"""
        if not self.test_article_id:
            self.log_result("Get Specific Article", False, "No test article ID available")
            return False
            
        try:
            headers = self.get_auth_headers()
            async with self.session.get(f"{BACKEND_URL}/api/articles/{self.test_article_id}", headers=headers) as response:
                if response.status == 200:
                    data = await response.json()
                    if data.get("id") == self.test_article_id:
                        self.log_result("Get Specific Article", True, f"Retrieved article: {data.get('title')}")
                        return True
                    else:
                        self.log_result("Get Specific Article", False, "Article ID mismatch")
                        return False
                else:
                    error_data = await response.text()
                    self.log_result("Get Specific Article", False, f"HTTP {response.status}", error_data)
                    return False
        except Exception as e:
            self.log_result("Get Specific Article", False, f"Exception: {str(e)}")
            return False
    
    async def test_update_article(self):
        """Test PUT /api/articles/{id} - update existing article"""
        if not self.test_article_id:
            self.log_result("Update Article", False, "No test article ID available")
            return False
            
        try:
            headers = self.get_auth_headers()
            headers["Content-Type"] = "application/json"
            
            update_data = {
                "title": "Updated Test Article",
                "subtitle": "Updated Test Subtitle",
                "content": "This is updated test content for the article.",
                "status": "published"
            }
            
            async with self.session.put(f"{BACKEND_URL}/api/articles/{self.test_article_id}", json=update_data, headers=headers) as response:
                if response.status == 200:
                    data = await response.json()
                    if data.get("title") == "Updated Test Article":
                        self.log_result("Update Article", True, f"Article updated successfully: {data.get('title')}")
                        return True
                    else:
                        self.log_result("Update Article", False, "Article title not updated")
                        return False
                else:
                    error_data = await response.text()
                    self.log_result("Update Article", False, f"HTTP {response.status}", error_data)
                    return False
        except Exception as e:
            self.log_result("Update Article", False, f"Exception: {str(e)}")
            return False
    
    async def test_delete_article(self):
        """Test DELETE /api/articles/{id} - delete article"""
        if not self.test_article_id:
            self.log_result("Delete Article", False, "No test article ID available")
            return False
            
        try:
            headers = self.get_auth_headers()
            async with self.session.delete(f"{BACKEND_URL}/api/articles/{self.test_article_id}", headers=headers) as response:
                if response.status == 200:
                    data = await response.json()
                    if "deleted successfully" in data.get("message", "").lower():
                        self.log_result("Delete Article", True, "Article deleted successfully")
                        return True
                    else:
                        self.log_result("Delete Article", False, f"Unexpected response: {data}")
                        return False
                else:
                    error_data = await response.text()
                    self.log_result("Delete Article", False, f"HTTP {response.status}", error_data)
                    return False
        except Exception as e:
            self.log_result("Delete Article", False, f"Exception: {str(e)}")
            return False
    
    async def test_error_handling(self):
        """Test error handling with invalid data"""
        try:
            headers = self.get_auth_headers()
            headers["Content-Type"] = "application/json"
            
            # Test with missing required fields
            invalid_data = {
                "title": "Test Article"
                # Missing content and category_id
            }
            
            async with self.session.post(f"{BACKEND_URL}/api/articles/", json=invalid_data, headers=headers) as response:
                if response.status in [400, 422]:
                    self.log_result("Error Handling - Missing Fields", True, f"HTTP {response.status} (proper validation)")
                    return True
                else:
                    error_data = await response.text()
                    self.log_result("Error Handling - Missing Fields", False, f"HTTP {response.status} (should be 400/422)", error_data)
                    return False
        except Exception as e:
            self.log_result("Error Handling - Missing Fields", False, f"Exception: {str(e)}")
            return False
    
    async def test_invalid_category_id(self):
        """Test with invalid category_id"""
        try:
            headers = self.get_auth_headers()
            headers["Content-Type"] = "application/json"
            
            article_data = {
                "title": "Test Article",
                "content": "Test content",
                "category_id": "invalid-category-id",
                "tags": ["test"],
                "status": "draft"
            }
            
            async with self.session.post(f"{BACKEND_URL}/api/articles/", json=article_data, headers=headers) as response:
                if response.status in [400, 404]:
                    self.log_result("Error Handling - Invalid Category", True, f"HTTP {response.status} (proper validation)")
                    return True
                else:
                    error_data = await response.text()
                    self.log_result("Error Handling - Invalid Category", False, f"HTTP {response.status} (should be 400/404)", error_data)
                    return False
        except Exception as e:
            self.log_result("Error Handling - Invalid Category", False, f"Exception: {str(e)}")
            return False
    
    async def test_authentication_requirements(self):
        """Test that protected endpoints require authentication"""
        try:
            # Test without authentication
            article_data = {
                "title": "Test Article",
                "content": "Test content",
                "category_id": "test-id",
                "status": "draft"
            }
            
            async with self.session.post(f"{BACKEND_URL}/api/articles/", json=article_data) as response:
                if response.status in [401, 403]:
                    self.log_result("Authentication Requirements", True, f"HTTP {response.status} (properly protected)")
                    return True
                else:
                    error_data = await response.text()
                    self.log_result("Authentication Requirements", False, f"HTTP {response.status} (should require auth)", error_data)
                    return False
        except Exception as e:
            self.log_result("Authentication Requirements", False, f"Exception: {str(e)}")
            return False
    
    async def run_all_tests(self):
        """Run all backend tests"""
        print(f"🚀 Starting Backend API Tests for Article Management")
        print(f"Backend URL: {BACKEND_URL}")
        print("=" * 60)
        
        # Step 1: Authenticate as admin
        if not await self.authenticate_admin():
            print("❌ Cannot proceed without authentication")
            return False
        
        # Step 2: Get categories for testing
        if not await self.test_categories_admin_endpoint():
            print("❌ Cannot proceed without valid category")
            return False
        
        # Step 3: Test article list endpoint (public)
        await self.test_articles_list_endpoint()
        
        # Step 4: Test article CRUD operations
        await self.test_create_article()
        await self.test_get_specific_article()
        await self.test_update_article()
        await self.test_delete_article()
        
        # Step 5: Test error handling
        await self.test_error_handling()
        await self.test_invalid_category_id()
        await self.test_authentication_requirements()
        
        # Summary
        print("=" * 60)
        print("📊 TEST SUMMARY")
        print("=" * 60)
        
        passed = sum(1 for r in self.results if r["success"])
        total = len(self.results)
        
        print(f"Total Tests: {total}")
        print(f"Passed: {passed}")
        print(f"Failed: {total - passed}")
        print(f"Success Rate: {(passed/total)*100:.1f}%")
        
        if total - passed > 0:
            print("\n❌ FAILED TESTS:")
            for result in self.results:
                if not result["success"]:
                    print(f"  - {result['test']}: {result['details']}")
        
        return passed == total

async def main():
    """Main test runner"""
    async with BackendTester() as tester:
        success = await tester.run_all_tests()
        return 0 if success else 1

if __name__ == "__main__":
    exit_code = asyncio.run(main())
    sys.exit(exit_code)