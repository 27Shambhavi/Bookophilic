import sys
import os
import unittest
from datetime import datetime

# Add app to path
ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BACKEND_DIR = os.path.join(ROOT_DIR, "backend")
if BACKEND_DIR not in sys.path:
    sys.path.append(BACKEND_DIR)

from app.models.book_model import Book, Genre, Quote, BookComment, PDFChunk
from app.models.user_model import User, UserPreference
from app.models.note_model import Note
from app.models.flashcard_model import Flashcard, RevisionSchedule
from app.models.reading_tracker_model import ReadingTracker, Recommendation, EmbeddingMetadata
from app.schemas.user_schema import RegisterResponse

class TestRagAndStats(unittest.TestCase):
    def test_pdf_chunk_structure(self):
        chunk = PDFChunk(
            book_id=1,
            user_id=1,
            chunk_index=0,
            content="Test text content page chunk",
            page_number=1
        )
        self.assertEqual(chunk.book_id, 1)
        self.assertEqual(chunk.user_id, 1)
        self.assertEqual(chunk.chunk_index, 0)
        self.assertEqual(chunk.content, "Test text content page chunk")
        self.assertEqual(chunk.page_number, 1)

    def test_book_has_pdf_property(self):
        b = Book(title="Test Book", author="Test Author", user_id=1)
        self.assertFalse(b.has_pdf)
        
        chunk = PDFChunk(chunk_index=0, content="Content", user_id=1)
        b.pdf_chunks.append(chunk)
        self.assertTrue(b.has_pdf)

    def test_register_response_schema(self):
        resp = RegisterResponse(
            id=123,
            email="test@example.com",
            full_name="Test User",
            created_at=datetime.utcnow(),
            access_token="fake_token",
            token_type="bearer"
        )
        self.assertEqual(resp.id, 123)
        self.assertEqual(resp.email, "test@example.com")
        self.assertEqual(resp.access_token, "fake_token")

if __name__ == '__main__':
    unittest.main()
