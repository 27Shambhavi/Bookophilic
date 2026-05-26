import os
import json
from typing import Dict, List, Optional

class SimpleVectorStore:
    def __init__(self, filepath: str = None):
        if filepath is None:
            # Default to the dataset/embeddings folder
            base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
            self.filepath = os.path.join(base_dir, "dataset", "embeddings", "vectors.json")
        else:
            self.filepath = filepath
            
        os.makedirs(os.path.dirname(self.filepath), exist_ok=True)
        self.store: Dict[str, List[float]] = {}
        self.load()

    def load(self):
        if os.path.exists(self.filepath):
            try:
                with open(self.filepath, 'r') as f:
                    self.store = json.load(f)
            except Exception as e:
                print(f"Error loading vector store: {e}")
                self.store = {}

    def save(self):
        try:
            with open(self.filepath, 'w') as f:
                json.dump(self.store, f)
        except Exception as e:
            print(f"Error saving vector store: {e}")

    def add_vector(self, vector_id: str, vector: List[float]):
        self.store[vector_id] = vector
        self.save()

    def add_vectors_batch(self, vectors: Dict[str, List[float]]):
        self.store.update(vectors)
        self.save()

    def get_vector(self, vector_id: str) -> Optional[List[float]]:
        return self.store.get(vector_id)

    def delete_vector(self, vector_id: str):
        if vector_id in self.store:
            del self.store[vector_id]
            self.save()
            
    def get_all(self) -> Dict[str, List[float]]:
        return self.store
