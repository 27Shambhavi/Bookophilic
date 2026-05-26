from ollama.ollama_client import OllamaClient
from shared.constants import REFLECTION_SYSTEM_PROMPT

class ReflectionAgent:
    def __init__(self, ollama_client: OllamaClient = None):
        self.client = ollama_client or OllamaClient()

    def generate_reflection_questions(self, note_content: str, book_title: str) -> str:
        """
        Analyze notes on a book and generate deep, open-ended reflective questions
        to stimulate further learning or critical reading.
        """
        prompt = f"""
The user has taken the following notes on the book '{book_title}':
---
{note_content}
---

Generate 3 thought-provoking reflection questions tailored to these notes. The questions should challenge the user to think deeper about the concepts, explore potential contradictions, or connect them to their personal experience.
Keep the tone encouraging, intellectual, and philosophical.
"""
        return self.client.generate(prompt, system_prompt=REFLECTION_SYSTEM_PROMPT)
