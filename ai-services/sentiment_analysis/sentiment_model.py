from ollama.ollama_client import OllamaClient
from shared.constants import SENTIMENT_SYSTEM_PROMPT
from shared.helper import parse_json_response

class SentimentAnalyzer:
    def __init__(self, ollama_client: OllamaClient = None):
        self.client = ollama_client or OllamaClient()

    def analyze_sentiment(self, text: str) -> dict:
        """
        Analyze the tone, emotional level, and key sentiments of note text.
        Returns a dict: {"sentiment": str, "score": float, "details": str}
        """
        prompt = f"""
Analyze the sentiment and emotional tone of the following text:
---
{text}
---

Your response MUST be a JSON object with:
- "sentiment": Overall classification (e.g. "Reflective", "Analytical", "Positive", "Critical", "Confused")
- "score": Rating from -1.0 (most negative) to 1.0 (most positive), where 0.0 is purely neutral/objective
- "details": 1 sentence summary of the writer's emotional/intellectual state

Do not write any commentary or markdown blocks outside the JSON. Return only the JSON object.
"""
        options = {"temperature": 0.1}
        raw_response = self.client.generate(
            prompt, 
            system_prompt=SENTIMENT_SYSTEM_PROMPT, 
            options=options
        )
        
        parsed = parse_json_response(raw_response)
        if not parsed:
            parsed = {
                "sentiment": "Neutral",
                "score": 0.0,
                "details": "Neutral or unable to analyze sentiment due to model limits."
            }
        return parsed
