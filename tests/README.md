# Bookophilic Testing Suite

Tests are grouped into component layers for automated verification.

## Testing Groups
- `backend/`: API route testing via FastAPI TestClient and pytest database mocks.
- `frontend/`: Unit tests for React components and routers.
- `ai/`: Precision testing for LLM JSON parsers, vector searches, and SM-2 scheduling.

## Running Tests
Run pytest at root:
```bash
pytest
```
