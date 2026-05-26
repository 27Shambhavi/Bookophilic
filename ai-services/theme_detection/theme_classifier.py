from ollama.ollama_client import OllamaClient
from shared.constants import THEME_SYSTEM_PROMPT
from shared.helper import parse_json_response
from typing import List, Dict, Any

class ThemeClassifier:
    def __init__(self, ollama_client: OllamaClient = None):
        self.client = ollama_client or OllamaClient()

    def classify_themes(self, text: str, available_genres: List[str] = None) -> Dict[str, Any]:
        """
        Classify text and extract primary themes and tag keywords.
        """
        genres_str = ", ".join(available_genres) if available_genres else "Self-help, Psychology, Finance, Philosophy, Fiction, Business, Spirituality, Science, Tech, History"
        
        prompt = f"""
Classify the major literary themes and genres for the text below.
Text:
---
{text}
---

Candidate Genres: {genres_str}

Your response MUST be a JSON object with:
- "primary_genre": The single most relevant genre from the candidates
- "secondary_genres": List of other matching genres
- "themes": List of 3-5 thematic keywords (e.g. "existentialism", "technological progression", "grief")
- "confidence": Float from 0.0 to 1.0

Return ONLY the JSON. No commentary.
"""
        options = {"temperature": 0.2}
        raw_response = self.client.generate(
            prompt,
            system_prompt=THEME_SYSTEM_PROMPT,
            options=options
        )
        
        parsed = parse_json_response(raw_response)
        if not parsed:
            parsed = {
                "primary_genre": "General",
                "secondary_genres": [],
                "themes": [],
                "confidence": 0.0
            }
        return parsed
