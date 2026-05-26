import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

const authService = {
  async register(email, password, fullName) {
    const response = await axios.post(`${API_URL}/auth/register`, {
      email,
      password,
      full_name: fullName,
    });
    return response.data;
  },

  async login(email, password) {
    const formData = new FormData();
    formData.append('username', email);
    formData.append('password', password);

    const response = await axios.post(`${API_URL}/auth/login`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (response.data.access_token) {
      localStorage.setItem('token', response.data.access_token);
    }
    return response.data;
  },

  logout() {
    localStorage.removeItem('token');
  },

  getToken() {
    return localStorage.getItem('token');
  },

  getAuthHeaders() {
    const token = this.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  },

  async getMe() {
    const response = await axios.get(`${API_URL}/auth/me`, {
      headers: this.getAuthHeaders(),
    });
    return response.data;
  },

  async getPreferences() {
    // Actually getPreferences is retrieved from user details or put preferences
    // For this endpoint we can request me
    const me = await this.getMe();
    return me.preferences;
  },

  async updatePreferences(preferences) {
    const response = await axios.put(`${API_URL}/auth/preferences`, preferences, {
      headers: this.getAuthHeaders(),
    });
    return response.data;
  },
};

export default authService;
