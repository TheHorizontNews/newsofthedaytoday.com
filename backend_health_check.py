#!/usr/bin/env python3
"""
Backend Health Check for Science Digest News
Quick verification of core API endpoints and functionality
"""

import asyncio
import aiohttp
import json
from datetime import datetime
import os
import sys

# Get backend URL from environment
BACKEND_URL = os.getenv('REACT_APP_BACKEND_URL', 'https://8ca882a8-83c2-4c10-93ce-a296b7f160ab.preview.emergentagent.com')

class HealthChecker:
    def __init__(self):
        self.session = None
        self.results = []
        self.auth_token = None
        
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
    
    async def test_basic_health_check(self):
        """Test basic backend health and connectivity"""
        try:
            # Test API articles endpoint as health check (public endpoint)
            async with self.session.get(f"{BACKEND_URL}/api/articles/") as response:
                if response.status == 200:
                    data = await response.json()
                    self.log_result("Basic Health Check", True, f"Backend API responding: {len(data)} articles found")
                    return True
                else:
                    error_data = await response.text()
                    self.log_result("Basic Health Check", False, f"HTTP {response.status}", error_data)
                    return False
        except Exception as e:
            self.log_result("Basic Health Check", False, f"Connection failed: {str(e)}")
            return False
    
    async def test_cors_headers(self):
        """Test CORS headers are properly configured"""
        try:
            headers = {
                'Origin': 'https://example.com',
                'Access-Control-Request-Method': 'GET',
                'Access-Control-Request-Headers': 'X-Requested-With'
            }
            async with self.session.options(f"{BACKEND_URL}/api/articles/", headers=headers) as response:
                cors_origin = response.headers.get('access-control-allow-origin')
                cors_methods = response.headers.get('access-control-allow-methods')
                cors_credentials = response.headers.get('access-control-allow-credentials')
                
                if cors_origin and cors_methods:
                    self.log_result("CORS Headers", True, f"CORS properly configured: Origin={cors_origin}, Methods={cors_methods}, Credentials={cors_credentials}")
                    return True
                else:
                    cors_headers = {
                        'access-control-allow-origin': cors_origin,
                        'access-control-allow-methods': cors_methods,
                        'access-control-allow-credentials': cors_credentials,
                    }
                    self.log_result("CORS Headers", False, "CORS headers missing", cors_headers)
                    return False
        except Exception as e:
            self.log_result("CORS Headers", False, f"Exception: {str(e)}")
            return False
    
    async def test_api_routing(self):
        """Test API routing is working with /api prefix"""
        try:
            # Test API auth endpoint (should return 422 for missing data)
            async with self.session.post(f"{BACKEND_URL}/api/auth/login", json={}) as response:
                if response.status == 422:  # Validation error for missing username/password
                    self.log_result("API Routing", True, "API routing working - validation error returned as expected")
                    return True
                else:
                    error_data = await response.text()
                    self.log_result("API Routing", False, f"HTTP {response.status}", error_data)
                    return False
        except Exception as e:
            self.log_result("API Routing", False, f"Exception: {str(e)}")
            return False
    
    async def test_admin_authentication(self):
        """Test admin authentication endpoint"""
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
                        self.log_result("Admin Authentication", True, "Admin login successful")
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
    
    async def test_articles_list_endpoint(self):
        """Test GET /api/articles/ endpoint"""
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
    
    async def test_categories_admin_endpoint(self):
        """Test GET /api/categories/admin endpoint"""
        try:
            headers = {"Authorization": f"Bearer {self.auth_token}"} if self.auth_token else {}
            async with self.session.get(f"{BACKEND_URL}/api/categories/admin", headers=headers) as response:
                if response.status == 200:
                    data = await response.json()
                    self.log_result("Categories Admin Endpoint", True, f"Retrieved {len(data)} categories")
                    return True
                else:
                    error_data = await response.text()
                    self.log_result("Categories Admin Endpoint", False, f"HTTP {response.status}", error_data)
                    return False
        except Exception as e:
            self.log_result("Categories Admin Endpoint", False, f"Exception: {str(e)}")
            return False
    
    async def test_article_creation_workflow(self):
        """Test article creation workflow"""
        if not self.auth_token:
            self.log_result("Article Creation Workflow", False, "No authentication token available")
            return False
            
        try:
            headers = {
                "Authorization": f"Bearer {self.auth_token}",
                "Content-Type": "application/json"
            }
            
            # First get a valid category ID
            async with self.session.get(f"{BACKEND_URL}/api/categories/admin", headers=headers) as response:
                if response.status != 200:
                    self.log_result("Article Creation Workflow", False, "Cannot get categories")
                    return False
                categories = await response.json()
                if not categories:
                    self.log_result("Article Creation Workflow", False, "No categories available")
                    return False
                category_id = categories[0]["id"]
            
            # Create test article
            article_data = {
                "title": "Health Check Test Article",
                "subtitle": "Testing article creation workflow",
                "content": "This is a test article created during health check to verify the article creation workflow is functioning properly.",
                "category_id": category_id,
                "tags": ["health-check", "test", "science"],
                "status": "draft",
                "seo_title": "Health Check Test Article - Science Digest News",
                "seo_description": "Test article for health check verification"
            }
            
            async with self.session.post(f"{BACKEND_URL}/api/articles/", json=article_data, headers=headers) as response:
                if response.status == 200:
                    data = await response.json()
                    article_id = data.get("id")
                    
                    # Clean up - delete the test article
                    if article_id:
                        await self.session.delete(f"{BACKEND_URL}/api/articles/{article_id}", headers=headers)
                    
                    self.log_result("Article Creation Workflow", True, f"Article created and cleaned up successfully")
                    return True
                else:
                    error_data = await response.text()
                    self.log_result("Article Creation Workflow", False, f"HTTP {response.status}", error_data)
                    return False
        except Exception as e:
            self.log_result("Article Creation Workflow", False, f"Exception: {str(e)}")
            return False
    
    async def test_error_handling(self):
        """Test error handling with invalid requests"""
        try:
            # Test 1: Invalid endpoint
            async with self.session.get(f"{BACKEND_URL}/api/nonexistent") as response:
                if response.status == 404:
                    self.log_result("Error Handling - Invalid Endpoint", True, "404 returned for invalid endpoint")
                else:
                    self.log_result("Error Handling - Invalid Endpoint", False, f"Expected 404, got {response.status}")
            
            # Test 2: Unauthorized access to protected endpoint
            async with self.session.post(f"{BACKEND_URL}/api/articles/", json={"title": "test"}) as response:
                if response.status in [401, 403]:
                    self.log_result("Error Handling - Unauthorized Access", True, f"HTTP {response.status} for unauthorized access")
                else:
                    self.log_result("Error Handling - Unauthorized Access", False, f"Expected 401/403, got {response.status}")
            
            # Test 3: Invalid JSON data
            headers = {"Authorization": f"Bearer {self.auth_token}"} if self.auth_token else {}
            async with self.session.post(f"{BACKEND_URL}/api/articles/", json={"invalid": "data"}, headers=headers) as response:
                if response.status in [400, 422]:
                    self.log_result("Error Handling - Invalid Data", True, f"HTTP {response.status} for invalid data")
                    return True
                else:
                    self.log_result("Error Handling - Invalid Data", False, f"Expected 400/422, got {response.status}")
                    return False
        except Exception as e:
            self.log_result("Error Handling", False, f"Exception: {str(e)}")
            return False
    
    async def test_seo_endpoints(self):
        """Test SEO endpoints are accessible"""
        try:
            seo_endpoints = [
                ("/api/seo/sitemap.xml", "application/xml"),
                ("/api/seo/robots.txt", "text/plain"),
                ("/api/seo/llms.txt", "text/plain")
            ]
            
            all_passed = True
            for endpoint, expected_content_type in seo_endpoints:
                async with self.session.get(f"{BACKEND_URL}{endpoint}") as response:
                    if response.status == 200:
                        content_type = response.headers.get('content-type', '').lower()
                        if expected_content_type.lower() in content_type:
                            self.log_result(f"SEO Endpoint {endpoint}", True, f"Accessible with correct content-type: {content_type}")
                        else:
                            self.log_result(f"SEO Endpoint {endpoint}", False, f"Wrong content-type: {content_type}")
                            all_passed = False
                    else:
                        self.log_result(f"SEO Endpoint {endpoint}", False, f"HTTP {response.status}")
                        all_passed = False
            
            return all_passed
        except Exception as e:
            self.log_result("SEO Endpoints", False, f"Exception: {str(e)}")
            return False
    
    async def run_health_check(self):
        """Run comprehensive health check"""
        print(f"🏥 Science Digest News Backend Health Check")
        print(f"Backend URL: {BACKEND_URL}")
        print("=" * 60)
        
        # Core health checks
        await self.test_basic_health_check()
        await self.test_cors_headers()
        await self.test_api_routing()
        
        # Authentication
        await self.test_admin_authentication()
        
        # Core endpoints
        await self.test_articles_list_endpoint()
        await self.test_categories_admin_endpoint()
        
        # Functionality tests
        await self.test_article_creation_workflow()
        
        # Error handling
        await self.test_error_handling()
        
        # SEO endpoints
        await self.test_seo_endpoints()
        
        # Summary
        print("=" * 60)
        print("📊 HEALTH CHECK SUMMARY")
        print("=" * 60)
        
        passed = sum(1 for r in self.results if r["success"])
        total = len(self.results)
        
        print(f"Total Checks: {total}")
        print(f"Passed: {passed}")
        print(f"Failed: {total - passed}")
        print(f"Health Score: {(passed/total)*100:.1f}%")
        
        if total - passed > 0:
            print("\n❌ FAILED CHECKS:")
            for result in self.results:
                if not result["success"]:
                    print(f"  - {result['test']}: {result['details']}")
        else:
            print("\n🎉 All health checks passed! Backend is fully operational.")
        
        return passed == total

async def main():
    """Main health check runner"""
    async with HealthChecker() as checker:
        success = await checker.run_health_check()
        return 0 if success else 1

if __name__ == "__main__":
    exit_code = asyncio.run(main())
    sys.exit(exit_code)