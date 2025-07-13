#!/usr/bin/env python3
"""
Backend API Testing for Edge Chronicle Phase 4 SEO Implementation
Tests all SEO endpoints and backend functionality
"""

import asyncio
import aiohttp
import json
import xml.etree.ElementTree as ET
from datetime import datetime
import os
import sys

# Get backend URL from environment
BACKEND_URL = os.getenv('REACT_APP_BACKEND_URL', 'https://751f5a33-569f-4a53-8fae-2462dbea2f2e.preview.emergentagent.com')

class BackendTester:
    def __init__(self):
        self.session = None
        self.results = []
        
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
    
    async def test_health_endpoint(self):
        """Test health check endpoint"""
        try:
            async with self.session.get(f"{BACKEND_URL}/health") as response:
                if response.status == 200:
                    data = await response.json()
                    if data.get("status") == "healthy":
                        self.log_result("Health Check", True, f"Status: {data.get('status')}")
                    else:
                        self.log_result("Health Check", False, f"Unexpected status: {data}")
                else:
                    self.log_result("Health Check", False, f"HTTP {response.status}")
        except Exception as e:
            self.log_result("Health Check", False, f"Exception: {str(e)}")
    
    async def test_root_endpoint(self):
        """Test root endpoint"""
        try:
            async with self.session.get(f"{BACKEND_URL}/") as response:
                if response.status == 200:
                    data = await response.json()
                    if "Edge Chronicle" in data.get("message", ""):
                        self.log_result("Root Endpoint", True, f"Message: {data.get('message')}")
                    else:
                        self.log_result("Root Endpoint", False, f"Unexpected response: {data}")
                else:
                    self.log_result("Root Endpoint", False, f"HTTP {response.status}")
        except Exception as e:
            self.log_result("Root Endpoint", False, f"Exception: {str(e)}")
    
    async def test_sitemap_xml(self):
        """Test sitemap.xml endpoint"""
        try:
            async with self.session.get(f"{BACKEND_URL}/api/seo/sitemap.xml") as response:
                if response.status == 200:
                    content = await response.text()
                    content_type = response.headers.get('content-type', '')
                    
                    # Check content type
                    if 'xml' not in content_type:
                        self.log_result("Sitemap XML", False, f"Wrong content type: {content_type}")
                        return
                    
                    # Parse XML to validate structure
                    try:
                        root = ET.fromstring(content)
                        if root.tag.endswith('urlset'):
                            urls = root.findall('.//{http://www.sitemaps.org/schemas/sitemap/0.9}url')
                            self.log_result("Sitemap XML", True, f"Valid XML with {len(urls)} URLs")
                        else:
                            self.log_result("Sitemap XML", False, f"Invalid XML structure, root tag: {root.tag}")
                    except ET.ParseError as e:
                        self.log_result("Sitemap XML", False, f"XML parse error: {str(e)}")
                else:
                    self.log_result("Sitemap XML", False, f"HTTP {response.status}")
        except Exception as e:
            self.log_result("Sitemap XML", False, f"Exception: {str(e)}")
    
    async def test_llms_txt(self):
        """Test llms.txt endpoint"""
        try:
            async with self.session.get(f"{BACKEND_URL}/api/seo/llms.txt") as response:
                if response.status == 200:
                    content = await response.text()
                    content_type = response.headers.get('content-type', '')
                    
                    # Check content type
                    if 'text/plain' not in content_type:
                        self.log_result("LLMS.txt", False, f"Wrong content type: {content_type}")
                        return
                    
                    # Check content structure
                    if "LLMS.txt" in content and "Edge Chronicle" in content:
                        lines = content.split('\n')
                        self.log_result("LLMS.txt", True, f"Valid text file with {len(lines)} lines")
                    else:
                        self.log_result("LLMS.txt", False, "Missing expected content headers")
                else:
                    self.log_result("LLMS.txt", False, f"HTTP {response.status}")
        except Exception as e:
            self.log_result("LLMS.txt", False, f"Exception: {str(e)}")
    
    async def test_llms_sitemap_xml(self):
        """Test llms-sitemap.xml endpoint"""
        try:
            async with self.session.get(f"{BACKEND_URL}/api/seo/llms-sitemap.xml") as response:
                if response.status == 200:
                    content = await response.text()
                    content_type = response.headers.get('content-type', '')
                    
                    # Check content type
                    if 'xml' not in content_type:
                        self.log_result("LLMS Sitemap XML", False, f"Wrong content type: {content_type}")
                        return
                    
                    # Parse XML to validate structure
                    try:
                        root = ET.fromstring(content)
                        if root.tag.endswith('urlset'):
                            urls = root.findall('.//{http://www.sitemaps.org/schemas/sitemap/0.9}url')
                            # Check for AI-specific metadata by looking for ai: namespace elements
                            ai_elements = [elem for elem in root.iter() if 'ai:' in elem.tag]
                            self.log_result("LLMS Sitemap XML", True, f"Valid XML with {len(urls)} URLs and {len(ai_elements)} AI metadata elements")
                        else:
                            self.log_result("LLMS Sitemap XML", False, f"Invalid XML structure, root tag: {root.tag}")
                    except ET.ParseError as e:
                        self.log_result("LLMS Sitemap XML", False, f"XML parse error: {str(e)}")
                else:
                    self.log_result("LLMS Sitemap XML", False, f"HTTP {response.status}")
        except Exception as e:
            self.log_result("LLMS Sitemap XML", False, f"Exception: {str(e)}")
    
    async def test_robots_txt(self):
        """Test robots.txt endpoint"""
        try:
            async with self.session.get(f"{BACKEND_URL}/api/seo/robots.txt") as response:
                if response.status == 200:
                    content = await response.text()
                    content_type = response.headers.get('content-type', '')
                    
                    # Check content type
                    if 'text/plain' not in content_type:
                        self.log_result("Robots.txt", False, f"Wrong content type: {content_type}")
                        return
                    
                    # Check content structure
                    required_elements = ["User-agent:", "Allow:", "Sitemap:", "Disallow:"]
                    missing_elements = [elem for elem in required_elements if elem not in content]
                    
                    if not missing_elements:
                        lines = content.split('\n')
                        self.log_result("Robots.txt", True, f"Valid robots.txt with {len(lines)} lines")
                    else:
                        self.log_result("Robots.txt", False, f"Missing elements: {missing_elements}")
                else:
                    self.log_result("Robots.txt", False, f"HTTP {response.status}")
        except Exception as e:
            self.log_result("Robots.txt", False, f"Exception: {str(e)}")
    
    async def test_api_routes(self):
        """Test existing API routes - expect authentication errors for protected routes"""
        routes_to_test = [
            ("/api/categories", "Categories endpoint"),
            ("/api/users", "Users endpoint"), 
            ("/api/articles", "Articles endpoint"),
            ("/api/auth/me", "Auth me endpoint")
        ]
        
        for route, description in routes_to_test:
            try:
                async with self.session.get(f"{BACKEND_URL}{route}") as response:
                    # These routes require authentication, so 403/401 is expected and correct
                    if response.status in [401, 403]:
                        self.log_result(f"API Route {route}", True, f"HTTP {response.status} (correctly protected)")
                    elif response.status == 307:
                        # Handle redirect
                        async with self.session.get(f"{BACKEND_URL}{route}/") as redirect_response:
                            if redirect_response.status in [401, 403]:
                                self.log_result(f"API Route {route}", True, f"HTTP {redirect_response.status} (correctly protected after redirect)")
                            else:
                                self.log_result(f"API Route {route}", False, f"HTTP {redirect_response.status} after redirect")
                    elif response.status == 200:
                        # Unexpected success without auth
                        self.log_result(f"API Route {route}", False, f"HTTP {response.status} (should require authentication)")
                    else:
                        self.log_result(f"API Route {route}", False, f"HTTP {response.status}")
            except Exception as e:
                self.log_result(f"API Route {route}", False, f"Exception: {str(e)}")
    
    async def test_seo_analytics_endpoint(self):
        """Test SEO analytics endpoint"""
        try:
            start_date = "2024-01-01"
            end_date = "2024-12-31"
            url = f"{BACKEND_URL}/api/seo/analytics/search-console?start_date={start_date}&end_date={end_date}"
            
            async with self.session.get(url) as response:
                if response.status == 200:
                    data = await response.json()
                    required_fields = ["clicks", "impressions", "ctr", "position"]
                    missing_fields = [field for field in required_fields if field not in data]
                    
                    if not missing_fields:
                        self.log_result("SEO Analytics", True, f"All required fields present: {list(data.keys())}")
                    else:
                        self.log_result("SEO Analytics", False, f"Missing fields: {missing_fields}")
                else:
                    self.log_result("SEO Analytics", False, f"HTTP {response.status}")
        except Exception as e:
            self.log_result("SEO Analytics", False, f"Exception: {str(e)}")
    
    async def test_database_integration(self):
        """Test database integration by checking if backend can connect to MongoDB"""
        try:
            # Test through a public endpoint that uses database
            async with self.session.get(f"{BACKEND_URL}/api/seo/sitemap.xml") as response:
                if response.status == 200:
                    content = await response.text()
                    # If sitemap generates successfully, database connection is working
                    if "urlset" in content:
                        self.log_result("Database Integration", True, "Database connection working (verified through sitemap generation)")
                    else:
                        self.log_result("Database Integration", False, "Sitemap endpoint accessible but content invalid")
                else:
                    self.log_result("Database Integration", False, f"HTTP {response.status}")
        except Exception as e:
            self.log_result("Database Integration", False, f"Exception: {str(e)}")
    
    async def test_health_and_root_endpoints(self):
        """Test health and root endpoints with proper error handling"""
        endpoints = [
            ("/health", "Health Check"),
            ("/", "Root Endpoint")
        ]
        
        for endpoint, name in endpoints:
            try:
                async with self.session.get(f"{BACKEND_URL}{endpoint}") as response:
                    if response.status == 200:
                        content_type = response.headers.get('content-type', '')
                        if 'application/json' in content_type:
                            data = await response.json()
                            if endpoint == "/health" and data.get("status") == "healthy":
                                self.log_result(name, True, f"Status: {data.get('status')}")
                            elif endpoint == "/" and "Edge Chronicle" in data.get("message", ""):
                                self.log_result(name, True, f"Message: {data.get('message')}")
                            else:
                                self.log_result(name, True, f"HTTP 200 with JSON response")
                        else:
                            # Might be HTML response due to routing
                            self.log_result(name, True, f"HTTP 200 (content-type: {content_type})")
                    else:
                        self.log_result(name, False, f"HTTP {response.status}")
            except Exception as e:
                self.log_result(name, False, f"Exception: {str(e)}")
    
    async def run_all_tests(self):
        """Run all backend tests"""
        print(f"🚀 Starting Backend API Tests for Edge Chronicle")
        print(f"Backend URL: {BACKEND_URL}")
        print("=" * 60)
        
        # Core endpoints
        await self.test_health_endpoint()
        await self.test_root_endpoint()
        
        # SEO endpoints
        await self.test_sitemap_xml()
        await self.test_llms_txt()
        await self.test_llms_sitemap_xml()
        await self.test_robots_txt()
        await self.test_seo_analytics_endpoint()
        
        # API routes
        await self.test_api_routes()
        
        # Database integration
        await self.test_database_integration()
        
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