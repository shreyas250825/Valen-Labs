"""AI enhancement for resume bullets (OpenAI preferred, Gemini fallback)."""
from __future__ import annotations

import logging
import os
from typing import Optional

import requests

from app.config import get_settings

logger = logging.getLogger(__name__)

PROMPT_PREFIX = (
    "Rewrite this resume bullet professionally with action verbs, impact, and conciseness. "
    "Return only the improved bullet text, no quotes or markdown.\n\nBullet:\n"
)


def enhance_resume_bullet(text: str) -> str:
    cleaned = (text or "").strip()
    if not cleaned:
        raise ValueError("text is empty")

    settings = get_settings()
    openai_key = getattr(settings, "OPENAI_API_KEY", None) or os.getenv("OPENAI_API_KEY")
    openai_model = getattr(settings, "OPENAI_MODEL", None) or os.getenv("OPENAI_MODEL", "gpt-4o-mini")
    if openai_key:
        out = _openai_complete(openai_key, PROMPT_PREFIX + cleaned, openai_model)
        if out:
            return out[:2000]

    try:
        from app.ai_engines.ollama_engine import OllamaEngine

        ol = OllamaEngine()
        if ol.available:
            raw = ol.call_ollama(PROMPT_PREFIX + cleaned, temperature=0.5, max_tokens=400)
            out = (raw or "").strip()
            if out:
                return out[:2000]
    except Exception as e:
        logger.warning("Ollama enhance failed: %s", e)

    try:
        from app.ai_engines.gemini_engine import GeminiEngine

        gem = GeminiEngine()
        raw = gem.call_gemini(PROMPT_PREFIX + cleaned, temperature=0.5, max_tokens=400)
        out = (raw or "").strip()
        if out:
            return out[:2000]
    except Exception as e:
        logger.warning("Gemini enhance failed: %s", e)

    raise RuntimeError(
        "No AI provider available (run Ollama locally, or set OPENAI_API_KEY or GEMINI_API_KEY)"
    )


def _openai_complete(api_key: str, prompt: str, model: str) -> Optional[str]:
    try:
        r = requests.post(
            "https://api.openai.com/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
            },
            json={
                "model": model,
                "messages": [{"role": "user", "content": prompt}],
                "max_tokens": 400,
                "temperature": 0.5,
            },
            timeout=60,
        )
        if r.status_code != 200:
            logger.warning("OpenAI error %s: %s", r.status_code, r.text[:500])
            return None
        data = r.json()
        choice = data.get("choices", [{}])[0]
        msg = choice.get("message", {}) or {}
        content = (msg.get("content") or "").strip()
        return content or None
    except Exception as e:
        logger.warning("OpenAI request failed: %s", e)
        return None
