import axios from 'axios';
import authService from './authService';

const API_URL = import.meta.env.VITE_API_URL || (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') ? 'http://localhost:8000/api' : 'https://bookophilic.onrender.com/api');

const noteService = {
  async getNotes() {
    const response = await axios.get(`${API_URL}/notes/`, {
      headers: authService.getAuthHeaders(),
    });
    return response.data;
  },

  async getBookNotes(bookId) {
    const response = await axios.get(`${API_URL}/notes/book/${bookId}`, {
      headers: authService.getAuthHeaders(),
    });
    return response.data;
  },

  async createNote(bookId, content, pageNumber) {
    const response = await axios.post(
      `${API_URL}/notes/`,
      { book_id: bookId, content, page_number: pageNumber },
      { headers: authService.getAuthHeaders() }
    );
    return response.data;
  },

  async updateNote(id, content, pageNumber) {
    const response = await axios.put(
      `${API_URL}/notes/${id}`,
      { content, page_number: pageNumber },
      { headers: authService.getAuthHeaders() }
    );
    return response.data;
  },

  async deleteNote(id) {
    const response = await axios.delete(`${API_URL}/notes/${id}`, {
      headers: authService.getAuthHeaders(),
    });
    return response.data;
  },

  async summarizeNotes(bookId) {
    const response = await axios.post(
      `${API_URL}/notes/book/${bookId}/summarize`,
      {},
      { headers: authService.getAuthHeaders() }
    );
    return response.data; // returns { summary: "..." }
  },

  async generateReflections(bookId) {
    const response = await axios.post(
      `${API_URL}/notes/book/${bookId}/reflect`,
      {},
      { headers: authService.getAuthHeaders() }
    );
    return response.data; // returns { reflections: "..." }
  },
  
  async getActionPoints(text) {
    const response = await axios.post(
      `${API_URL}/notes/action-points`,
      { text },
      { headers: authService.getAuthHeaders() }
    );
    return response.data; // returns { action_points: "..." }
  },

  async getQuiz(text) {
    const response = await axios.post(
      `${API_URL}/notes/quiz`,
      { text },
      { headers: authService.getAuthHeaders() }
    );
    return response.data; // returns { quiz: "..." }
  },

  async getSingleSummary(text) {
    const response = await axios.post(
      `${API_URL}/notes/summarize-single`,
      { text },
      { headers: authService.getAuthHeaders() }
    );
    return response.data; // returns { summary: "..." }
  },

  async semanticSearch(query) {
    const response = await axios.get(`${API_URL}/notes/semantic-search`, {
      params: { query },
      headers: authService.getAuthHeaders(),
    });
    return response.data; // returns list of matching notes sorted by score
  },
};

export default noteService;
