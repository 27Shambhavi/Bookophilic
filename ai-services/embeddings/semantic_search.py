from typing import List, Dict, Tuple
from embeddings.embedding_generator import EmbeddingGenerator
from embeddings.vector_store import SimpleVectorStore
from shared.helper import cosine_similarity

class SemanticSearch:
    def __init__(self, generator: EmbeddingGenerator = None, store: SimpleVectorStore = None):
        self.generator = generator or EmbeddingGenerator()
        self.store = store or SimpleVectorStore()

    def search(self, query: str, top_k: int = 5) -> List[Tuple[str, float]]:
        """Search for vector IDs matching the semantic meaning of the query."""
        query_vector = self.generator.generate_embedding(query)
        if not query_vector:
            return []

        all_vectors = self.store.get_all()
        results: List[Tuple[str, float]] = []

        for vector_id, vector in all_vectors.items():
            sim = cosine_similarity(query_vector, vector)
            results.append((vector_id, sim))

        # Sort descending by similarity score
        results.sort(key=lambda x: x[1], reverse=True)
        return results[:top_k]
