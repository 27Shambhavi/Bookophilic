import axios from 'axios';
import authService from './authService';

const API_URL = import.meta.env.VITE_API_URL || (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') ? 'http://localhost:8000/api' : 'https://bookophilic.onrender.com/api');

const aiService = {
  // Flashcards APIs
  async getFlashcards() {
    const response = await axios.get(`${API_URL}/flashcards/`, {
      headers: authService.getAuthHeaders(),
    });
    return response.data;
  },

  async getBookFlashcards(bookId) {
    const response = await axios.get(`${API_URL}/flashcards/book/${bookId}`, {
      headers: authService.getAuthHeaders(),
    });
    return response.data;
  },

  async getDueFlashcards() {
    const response = await axios.get(`${API_URL}/flashcards/due`, {
      headers: authService.getAuthHeaders(),
    });
    return response.data;
  },

  async createFlashcard(bookId, question, answer, difficulty = 'medium') {
    const response = await axios.post(
      `${API_URL}/flashcards/`,
      { book_id: bookId, question, answer, difficulty },
      { headers: authService.getAuthHeaders() }
    );
    return response.data;
  },

  async generateFlashcards(bookId, textContent, count = 5) {
    const response = await axios.post(
      `${API_URL}/flashcards/generate`,
      { book_id: bookId, text_content: textContent, count },
      { headers: authService.getAuthHeaders() }
    );
    return response.data;
  },

  async submitReview(flashcardId, rating) {
    const response = await axios.post(
      `${API_URL}/flashcards/review`,
      { flashcard_id: flashcardId, rating },
      { headers: authService.getAuthHeaders() }
    );
    return response.data;
  },

  // Recommendations APIs
  async getRecommendations() {
    const response = await axios.get(`${API_URL}/recommendations/`, {
      headers: authService.getAuthHeaders(),
    });
    return response.data;
  },

  async generateRecommendations() {
    const response = await axios.post(
      `${API_URL}/recommendations/generate`,
      {},
      { headers: authService.getAuthHeaders() }
    );
    return response.data;
  },

  // Sentiment and Themes
  async analyzeSentiment(text) {
    const response = await axios.post(
      `${API_URL}/ai/sentiment`,
      { text },
      { headers: authService.getAuthHeaders() }
    );
    return response.data;
  },

  async analyzeTheme(text) {
    const response = await axios.post(
      `${API_URL}/ai/theme`,
      { text },
      { headers: authService.getAuthHeaders() }
    );
    return response.data;
  },

  async getReadingCoachingInsights(mentor = 'Socrates') {
    const response = await axios.get(`${API_URL}/ai/insights`, {
      params: { mentor },
      headers: authService.getAuthHeaders(),
    });
    return response.data; // returns { insights: "..." }
  },

  // Reading Tracker Sessions
  async startReadingSession(bookId) {
    const response = await axios.post(
      `${API_URL}/ai/session/start`,
      { book_id: bookId },
      { headers: authService.getAuthHeaders() }
    );
    return response.data;
  },

  async endReadingSession(sessionId, pagesRead, notesTaken) {
    const response = await axios.post(
      `${API_URL}/ai/session/end/${sessionId}`,
      { pages_read: pagesRead, notes_taken: notesTaken },
      { headers: authService.getAuthHeaders() }
    );
    return response.data;
  },

  // Personal RAG & PDF upload
  async queryRag(query) {
    const response = await axios.post(
      `${API_URL}/ai/rag`,
      { query },
      { headers: authService.getAuthHeaders() }
    );
    return response.data;
  },

  async uploadBookPdf(bookId, file) {
    const formData = new FormData();
    formData.append('file', file);
    const response = await axios.post(
      `${API_URL}/ai/book/${bookId}/upload-pdf`,
      formData,
      {
        headers: {
          ...authService.getAuthHeaders(),
          'Content-Type': 'multipart/form-data'
        }
      }
    );
    return response.data;
  },
};

export default aiService;
