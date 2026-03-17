# backend/app/utils/text_utils.py
import re
from typing import List

def clean_text(text: str) -> str:
    """Clean and normalize text"""
    if not text:
        return ""
    
    # Remove extra whitespace
    text = re.sub(r'\s+', ' ', text)
    
    # Remove special characters but keep basic punctuation
    text = re.sub(r'[^\w\s\.\,\!\?\-]', '', text)
    
    return text.strip()

def count_filler_words(text: str) -> int:
    """Count filler words in text"""
    filler_words = ['um', 'uh', 'like', 'you know', 'actually', 'basically', 'literally']
    
    count = 0
    text_lower = text.lower()
    
    for word in filler_words:
        count += len(re.findall(r'\b' + re.escape(word) + r'\b', text_lower))
    
    return count

def calculate_speech_metrics(text: str, duration_seconds: int) -> dict[str, float]:
    """Calculate speech metrics from text and duration"""
    word_count = len(text.split())
    
    if duration_seconds > 0:
        words_per_minute = (word_count / duration_seconds) * 60
        pause_frequency = len(re.findall(r'[\.\,\!\?]', text)) / duration_seconds
    else:
        words_per_minute = 0
        pause_frequency = 0
    
    return {
        "word_count": word_count,
        "words_per_minute": words_per_minute,
        "pause_frequency": pause_frequency,
        "filler_words": count_filler_words(text)
    }

def extract_keywords(text: str, max_keywords: int = 10) -> List[str]:
    """Extract important keywords from text"""
    # Remove common stop words
    stop_words = {'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'}
    
    words = re.findall(r'\b\w+\b', text.lower())
    meaningful_words = [word for word in words if word not in stop_words and len(word) > 2]
    
    # Count frequency
    word_freq = {}
    for word in meaningful_words:
        word_freq[word] = word_freq.get(word, 0) + 1
    
    # Sort by frequency and return top keywords
    sorted_words = sorted(word_freq.items(), key=lambda x: x[1], reverse=True)
    return [word for word, freq in sorted_words[:max_keywords]]