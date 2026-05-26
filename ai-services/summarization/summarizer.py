from ollama.ollama_client import OllamaClient
from summarization.prompts import SUMMARIZE_BOOK_PROMPT, SUMMARIZE_NOTES_PROMPT
from shared.constants import SUMMARIZATION_SYSTEM_PROMPT

class BookSummarizer:
    def __init__(self, ollama_client: OllamaClient = None):
        self.client = ollama_client or OllamaClient()

    def summarize_book(self, title: str, author: str, content: str) -> str:
        prompt = SUMMARIZE_BOOK_PROMPT.format(
            title=title,
            author=author,
            content=content
        )
        return self.client.generate(prompt, system_prompt=SUMMARIZATION_SYSTEM_PROMPT)

    def summarize_notes(self, notes_text: str) -> str:
        prompt = SUMMARIZE_NOTES_PROMPT.format(notes_text=notes_text)
        return self.client.generate(prompt, system_prompt=SUMMARIZATION_SYSTEM_PROMPT)
