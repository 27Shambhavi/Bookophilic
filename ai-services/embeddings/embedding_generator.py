from ollama.ollama_client import OllamaClient
from typing import List

class EmbeddingGenerator:
    def __init__(self, ollama_client: OllamaClient = None):
        self.client = ollama_client or OllamaClient()

    def generate_embedding(self, text: str) -> List[float]:
        """Generate embedding vector for a single text fragment."""
        if not text or not text.strip():
            return []
        return self.client.get_embeddings(text)

    def generate_embeddings_batch(self, texts: List[str]) -> List[List[float]]:
        """Generate embedding vectors for a batch of text fragments."""
        results = []
        for text in texts:
            results.append(self.generate_embedding(text))
        return results
