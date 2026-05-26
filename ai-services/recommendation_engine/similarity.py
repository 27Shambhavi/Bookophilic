from typing import List, Set
from shared.helper import cosine_similarity

def genre_overlap(genres1: List[str], genres2: List[str]) -> float:
    """Calculates Jaccard similarity score between two lists of genres."""
    if not genres1 or not genres2:
        return 0.0
    set1 = set(g.strip().lower() for g in genres1)
    set2 = set(g.strip().lower() for g in genres2)
    intersection = set1.intersection(set2)
    union = set1.union(set2)
    return len(intersection) / len(union) if union else 0.0

def compute_combined_score(genre_sim: float, content_sim: float, genre_weight: float = 0.4) -> float:
    """Combines genre Jaccard similarity and semantic embedding similarity."""
    return (genre_sim * genre_weight) + (content_sim * (1.0 - genre_weight))
