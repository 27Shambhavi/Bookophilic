import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') ? 'http://localhost:8000/api' : 'https://bookophilic.onrender.com/api');

const authService = {
  async register(email, password, fullName) {
    const cleanEmail = email.trim().toLowerCase();
    const response = await axios.post(`${API_URL}/auth/register`, {
      email: cleanEmail,
      password,
      full_name: fullName,
    });
    return response.data;
  },

  async login(email, password) {
    const cleanEmail = email.trim().toLowerCase();
    const formData = new FormData();
    formData.append('username', cleanEmail);
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
    const me = await this.getMe();
    return me.preferences;
  },

  async updatePreferences(preferences) {
    const response = await axios.put(`${API_URL}/auth/preferences`, preferences, {
      headers: this.getAuthHeaders(),
    });
    return response.data;
  },

  async forgotPassword(email) {
    const cleanEmail = email.trim().toLowerCase();
    const response = await axios.post(`${API_URL}/auth/forgot-password`, { email: cleanEmail });
    return response.data;
  },

  async verifyOtp(email, otp) {
    const cleanEmail = email.trim().toLowerCase();
    const response = await axios.post(`${API_URL}/auth/verify-otp`, { email: cleanEmail, otp });
    return response.data;
  },

  async resetPassword(resetToken, newPassword) {
    const response = await axios.post(`${API_URL}/auth/reset-password`, {
      reset_token: resetToken,
      new_password: newPassword,
    });
    return response.data;
  },

  async changePassword(oldPassword, newPassword) {
    const response = await axios.put(`${API_URL}/auth/change-password`, {
      old_password: oldPassword,
      new_password: newPassword,
    }, {
      headers: this.getAuthHeaders(),
    });
    return response.data;
  },

  async getReadingSessions() {
    const response = await axios.get(`${API_URL}/ai/sessions`, {
      headers: this.getAuthHeaders(),
    });
    return response.data;
  },
};

export default authService;
