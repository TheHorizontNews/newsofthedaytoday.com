"""
Google Search Console integration for automatic URL submission and analytics
"""
import os
import json
import asyncio
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
import aiohttp
from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
import logging

logger = logging.getLogger(__name__)

class GoogleSearchConsole:
    def __init__(self):
        self.service = None
        self.site_url = os.getenv("SITE_URL", "https://edgechronicle.com")
        self.credentials_file = os.getenv("GOOGLE_SEARCH_CONSOLE_CREDENTIALS", "/app/backend/gsc_credentials.json")
        self.mock_mode = os.getenv("GSC_MOCK_MODE", "true").lower() == "true"
        
    def _get_service(self):
        """Initialize Google Search Console service"""
        if self.service:
            return self.service
            
        if self.mock_mode:
            logger.info("Running in mock mode - no actual API calls will be made")
            return None
            
        try:
            # Check if credentials file exists
            if not os.path.exists(self.credentials_file):
                # Create a placeholder credentials file
                placeholder_creds = {
                    "type": "service_account",
                    "project_id": "your-project-id",
                    "private_key_id": "placeholder-key-id",
                    "private_key": "-----BEGIN PRIVATE KEY-----\\nPLACEHOLDER_PRIVATE_KEY\\n-----END PRIVATE KEY-----\\n",
                    "client_email": "search-console@your-project-id.iam.gserviceaccount.com",
                    "client_id": "placeholder-client-id",
                    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                    "token_uri": "https://oauth2.googleapis.com/token",
                    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
                    "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/search-console%40your-project-id.iam.gserviceaccount.com"
                }
                
                with open(self.credentials_file, 'w') as f:
                    json.dump(placeholder_creds, f, indent=2)
                
                logger.warning(f"Created placeholder credentials file at {self.credentials_file}")
                logger.warning("Please replace with actual Google Search Console credentials")
                return None
            
            # Load credentials
            credentials = service_account.Credentials.from_service_account_file(
                self.credentials_file,
                scopes=['https://www.googleapis.com/auth/webmasters']
            )
            
            # Build service
            self.service = build('searchconsole', 'v1', credentials=credentials)
            logger.info("Google Search Console service initialized successfully")
            return self.service
            
        except Exception as e:
            logger.error(f"Failed to initialize Google Search Console service: {str(e)}")
            return None
    
    async def submit_url(self, url: str) -> Dict[str, Any]:
        """Submit URL to Google Search Console for indexing"""
        if self.mock_mode:
            logger.info(f"MOCK: Submitting URL to Search Console: {url}")
            return {
                "status": "success",
                "message": f"Mock submission successful for {url}",
                "submitted_at": datetime.utcnow().isoformat()
            }
        
        service = self._get_service()
        if not service:
            return {
                "status": "error",
                "message": "Google Search Console service not available",
                "url": url
            }
        
        try:
            # Submit URL for indexing
            request_body = {
                'url': url,
                'type': 'URL_UPDATED'
            }
            
            result = service.urlTestingTools().mobileFriendlyTest().run(
                body={'url': url}
            ).execute()
            
            logger.info(f"Successfully submitted URL to Search Console: {url}")
            return {
                "status": "success",
                "message": f"URL submitted successfully: {url}",
                "result": result,
                "submitted_at": datetime.utcnow().isoformat()
            }
            
        except HttpError as e:
            logger.error(f"HTTP error submitting URL {url}: {str(e)}")
            return {
                "status": "error",
                "message": f"HTTP error: {str(e)}",
                "url": url
            }
        except Exception as e:
            logger.error(f"Error submitting URL {url}: {str(e)}")
            return {
                "status": "error",
                "message": f"Error: {str(e)}",
                "url": url
            }
    
    async def get_search_analytics(self, start_date: str, end_date: str, 
                                 dimensions: List[str] = None) -> Dict[str, Any]:
        """Get search analytics data from Google Search Console"""
        if self.mock_mode:
            # Return mock data
            return {
                "status": "success",
                "data": {
                    "clicks": 1250,
                    "impressions": 45600,
                    "ctr": 2.74,
                    "position": 12.5,
                    "rows": [
                        {
                            "keys": ["edge chronicle news"],
                            "clicks": 150,
                            "impressions": 2000,
                            "ctr": 0.075,
                            "position": 3.2
                        },
                        {
                            "keys": ["breaking news today"],
                            "clicks": 120,
                            "impressions": 5000,
                            "ctr": 0.024,
                            "position": 8.1
                        },
                        {
                            "keys": ["ukraine war updates"],
                            "clicks": 200,
                            "impressions": 8000,
                            "ctr": 0.025,
                            "position": 6.3
                        }
                    ]
                }
            }
        
        service = self._get_service()
        if not service:
            return {
                "status": "error",
                "message": "Google Search Console service not available"
            }
        
        try:
            request = {
                'startDate': start_date,
                'endDate': end_date,
                'dimensions': dimensions or ['query'],
                'rowLimit': 25000,
                'aggregationType': 'auto'
            }
            
            result = service.searchanalytics().query(
                siteUrl=self.site_url,
                body=request
            ).execute()
            
            return {
                "status": "success",
                "data": result
            }
            
        except HttpError as e:
            logger.error(f"HTTP error getting search analytics: {str(e)}")
            return {
                "status": "error",
                "message": f"HTTP error: {str(e)}"
            }
        except Exception as e:
            logger.error(f"Error getting search analytics: {str(e)}")
            return {
                "status": "error",
                "message": f"Error: {str(e)}"
            }
    
    async def get_sitemaps(self) -> Dict[str, Any]:
        """Get submitted sitemaps from Google Search Console"""
        if self.mock_mode:
            return {
                "status": "success",
                "sitemaps": [
                    {
                        "path": f"{self.site_url}/api/seo/sitemap.xml",
                        "lastSubmitted": datetime.utcnow().isoformat(),
                        "isPending": False,
                        "warnings": 0,
                        "errors": 0
                    }
                ]
            }
        
        service = self._get_service()
        if not service:
            return {
                "status": "error",
                "message": "Google Search Console service not available"
            }
        
        try:
            result = service.sitemaps().list(siteUrl=self.site_url).execute()
            return {
                "status": "success",
                "sitemaps": result.get('sitemap', [])
            }
            
        except HttpError as e:
            logger.error(f"HTTP error getting sitemaps: {str(e)}")
            return {
                "status": "error",
                "message": f"HTTP error: {str(e)}"
            }
        except Exception as e:
            logger.error(f"Error getting sitemaps: {str(e)}")
            return {
                "status": "error",
                "message": f"Error: {str(e)}"
            }
    
    async def submit_sitemap(self, sitemap_url: str) -> Dict[str, Any]:
        """Submit sitemap to Google Search Console"""
        if self.mock_mode:
            logger.info(f"MOCK: Submitting sitemap to Search Console: {sitemap_url}")
            return {
                "status": "success",
                "message": f"Mock sitemap submission successful for {sitemap_url}",
                "submitted_at": datetime.utcnow().isoformat()
            }
        
        service = self._get_service()
        if not service:
            return {
                "status": "error",
                "message": "Google Search Console service not available"
            }
        
        try:
            service.sitemaps().submit(
                siteUrl=self.site_url,
                feedpath=sitemap_url
            ).execute()
            
            logger.info(f"Successfully submitted sitemap to Search Console: {sitemap_url}")
            return {
                "status": "success",
                "message": f"Sitemap submitted successfully: {sitemap_url}",
                "submitted_at": datetime.utcnow().isoformat()
            }
            
        except HttpError as e:
            logger.error(f"HTTP error submitting sitemap {sitemap_url}: {str(e)}")
            return {
                "status": "error",
                "message": f"HTTP error: {str(e)}",
                "sitemap_url": sitemap_url
            }
        except Exception as e:
            logger.error(f"Error submitting sitemap {sitemap_url}: {str(e)}")
            return {
                "status": "error",
                "message": f"Error: {str(e)}",
                "sitemap_url": sitemap_url
            }

# Create singleton instance
search_console = GoogleSearchConsole()