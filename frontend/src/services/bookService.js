import axios from 'axios';
import authService from './authService';

const API_URL = import.meta.env.VITE_API_URL || (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') ? 'http://localhost:8000/api' : 'https://bookophilic.onrender.com/api');

const bookService = {
  async getBooks() {
    const response = await axios.get(`${API_URL}/books/`, {
      headers: authService.getAuthHeaders(),
    });
    return response.data;
  },

  async getBook(id) {
    const response = await axios.get(`${API_URL}/books/${id}`, {
      headers: authService.getAuthHeaders(),
    });
    return response.data;
  },

  async createBook(bookData) {
    const response = await axios.post(`${API_URL}/books/`, bookData, {
      headers: authService.getAuthHeaders(),
    });
    return response.data;
  },

  async updateBook(id, bookData) {
    const response = await axios.put(`${API_URL}/books/${id}`, bookData, {
      headers: authService.getAuthHeaders(),
    });
    return response.data;
  },

  async deleteBook(id) {
    const response = await axios.delete(`${API_URL}/books/${id}`, {
      headers: authService.getAuthHeaders(),
    });
    return response.data;
  },

  async getGenres() {
    const response = await axios.get(`${API_URL}/books/genres`, {
      headers: authService.getAuthHeaders(),
    });
    return response.data;
  },

  async createGenre(name) {
    const response = await axios.post(`${API_URL}/books/genres`, { name }, {
      headers: authService.getAuthHeaders(),
    });
    return response.data;
  },

  async getComments(bookId) {
    const response = await axios.get(`${API_URL}/books/${bookId}/comments`, {
      headers: authService.getAuthHeaders(),
    });
    return response.data;
  },

  async createComment(bookId, content) {
    const response = await axios.post(`${API_URL}/books/${bookId}/comments`, { content }, {
      headers: authService.getAuthHeaders(),
    });
    return response.data;
  },
};

export default bookService;
