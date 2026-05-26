import re
import json
import numpy as np

def clean_text(text: str) -> str:
    """Removes excessive whitespace and standardizes text layout."""
    if not text:
        return ""
    text = re.sub(r'\s+', ' ', text)
    return text.strip()

def parse_json_response(raw_text: str) -> dict:
    """Extracts and parses JSON structures from raw LLM responses."""
    try:
        # Check if direct JSON parse works
        return json.loads(raw_text)
    except json.JSONDecodeError:
        # Attempt to extract markdown code blocks
        match = re.search(r'```(?:json)?\s*([\s\S]*?)\s*```', raw_text)
        if match:
            try:
                return json.loads(match.group(1))
            except json.JSONDecodeError:
                pass
        
        # Last resort: search for boundaries
        first_brace = raw_text.find('{')
        last_brace = raw_text.rfind('}')
        if first_brace != -1 and last_brace != -1:
            try:
                return json.loads(raw_text[first_brace:last_brace+1])
            except json.JSONDecodeError:
                pass
    return {}

def cosine_similarity(v1, v2) -> float:
    """Calculates cosine similarity between two numeric lists/vectors."""
    arr1 = np.array(v1)
    arr2 = np.array(v2)
    if arr1.size == 0 or arr2.size == 0:
        return 0.0
    norm1 = np.linalg.norm(arr1)
    norm2 = np.linalg.norm(arr2)
    if norm1 == 0 or norm2 == 0:
        return 0.0
    return float(np.dot(arr1, arr2) / (norm1 * norm2))
