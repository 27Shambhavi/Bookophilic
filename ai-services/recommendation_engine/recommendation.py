from typing import List, Dict, Any
from recommendation_engine.similarity import genre_overlap, compute_combined_score
from embeddings.embedding_generator import EmbeddingGenerator
from shared.helper import cosine_similarity
from ollama.ollama_client import OllamaClient

class BookRecommendationEngine:
    def __init__(self, ollama_client: OllamaClient = None):
        self.generator = EmbeddingGenerator(ollama_client)
        self.client = ollama_client or OllamaClient()

    def generate_recommendations(
        self, 
        user_preferences: Dict[str, Any], 
        user_books: List[Dict[str, Any]], 
        catalog: List[Dict[str, Any]], 
        top_n: int = 5
    ) -> List[Dict[str, Any]]:
        """
        Generate book recommendations based on user preferences and current books.
        user_preferences keys: 'preferred_genres' (List[str])
        catalog items keys: 'id', 'title', 'author', 'description', 'genres' (List[str])
        """
        preferred_genres = user_preferences.get("preferred_genres", [])
        
        # Build user vector profile from user's current reading/completed descriptions
        user_book_vectors = []
        for b in user_books:
            desc = b.get("description", "")
            if desc:
                vec = self.generator.generate_embedding(desc)
                if vec:
                    user_book_vectors.append(vec)
        
        # Average vector or fallback to empty
        user_profile_vector = []
        if user_book_vectors:
            user_profile_vector = list(map(sum, zip(*user_book_vectors)))
            user_profile_vector = [val / len(user_book_vectors) for val in user_profile_vector]

        recommendations = []
        
        # Calculate scores for candidate books in catalog
        # Filter out books already added by user
        user_book_ids = {b.get("id") for b in user_books}

        for candidate in catalog:
            if candidate.get("id") in user_book_ids:
                continue

            candidate_genres = candidate.get("genres", [])
            genre_sim = genre_overlap(preferred_genres, candidate_genres)
            
            # Content similarity
            content_sim = 0.0
            candidate_desc = candidate.get("description", "")
            if user_profile_vector and candidate_desc:
                candidate_vector = self.generator.generate_embedding(candidate_desc)
                if candidate_vector:
                    content_sim = cosine_similarity(user_profile_vector, candidate_vector)
            
            score = compute_combined_score(genre_sim, content_sim)
            
            recommendations.append({
                "book_id": candidate.get("id"),
                "recommended_title": candidate.get("title"),
                "recommended_author": candidate.get("author"),
                "score": score,
                "reason": f"Matches your interest in {', '.join(candidate_genres[:2])} and shares thematic similarities with your library."
            })

        # Sort descending by score
        recommendations.sort(key=lambda x: x["score"], reverse=True)
        return recommendations[:top_n]
