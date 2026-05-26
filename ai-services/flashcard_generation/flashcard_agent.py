from ollama.ollama_client import OllamaClient
from flashcard_generation.templates import FLASHCARD_GENERATION_PROMPT
from shared.constants import FLASHCARD_SYSTEM_PROMPT
from shared.helper import parse_json_response
from typing import List, Dict

class FlashcardAgent:
    def __init__(self, ollama_client: OllamaClient = None):
        self.client = ollama_client or OllamaClient()

    def generate_flashcards(self, text: str, num_cards: int = 5) -> List[Dict[str, str]]:
        """Generate a list of question-and-answer dicts based on the provided text."""
        prompt = FLASHCARD_GENERATION_PROMPT.format(text=text, num_cards=num_cards)
        
        # Configure model options for low temperature to encourage strict JSON compliance
        options = {
            "temperature": 0.2
        }
        
        raw_response = self.client.generate(
            prompt, 
            system_prompt=FLASHCARD_SYSTEM_PROMPT, 
            options=options
        )
        
        parsed = parse_json_response(raw_response)
        if isinstance(parsed, list):
            return parsed
        elif isinstance(parsed, dict) and "flashcards" in parsed:
            # Handle cases where model wraps the array in a dict
            return parsed["flashcards"]
            
        # If parsing fails or returns a non-list, try parsing lines as Q/A
        return []
