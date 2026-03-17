# backend/app/utils/http_utils.py
import aiohttp
import asyncio
from typing import Dict, Any, Optional
import json

class HTTPClient:
    def __init__(self):
        self.session = None
    
    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        await self.session.close()
    
    async def post(self, url: str, data: Dict[str, Any], headers: Optional[Dict[str, str]] = None) -> Dict[str, Any]:
        """Make POST request"""
        if headers is None:
            headers = {"Content-Type": "application/json"}
        
        try:
            async with self.session.post(url, json=data, headers=headers) as response:
                return await self._handle_response(response)
        except Exception as e:
            raise Exception(f"HTTP POST request failed: {str(e)}")
    
    async def get(self, url: str, headers: Optional[Dict[str, str]] = None) -> Dict[str, Any]:
        """Make GET request"""
        try:
            async with self.session.get(url, headers=headers) as response:
                return await self._handle_response(response)
        except Exception as e:
            raise Exception(f"HTTP GET request failed: {str(e)}")
    
    async def _handle_response(self, response):
        """Handle HTTP response"""
        if response.status == 200:
            return await response.json()
        else:
            error_text = await response.text()
            raise Exception(f"HTTP {response.status}: {error_text}")

# Sync version for non-async contexts
def make_post_request(url: str, data: Dict[str, Any], headers: Optional[Dict[str, str]] = None) -> Dict[str, Any]:
    """Synchronous POST request"""
    import requests
    try:
        response = requests.post(url, json=data, headers=headers)
        response.raise_for_status()
        return response.json()
    except Exception as e:
        raise Exception(f"HTTP POST request failed: {str(e)}")