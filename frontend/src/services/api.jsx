import axios from 'axios';

// Create axios instance with base URL
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
};

// Discussion APIs
export const discussionAPI = {
  getAll: (params) => api.get('/discussions', { params }),
  getOne: (id) => api.get(`/discussions/${id}`),
  create: (data) => api.post('/discussions', data),
  update: (id, data) => api.put(`/discussions/${id}`, data),
  delete: (id) => api.delete(`/discussions/${id}`),
  vote: (id, voteType) => api.post(`/discussions/${id}/vote`, { voteType }),
};

// Comment APIs
export const commentAPI = {
  create: (data) => api.post('/comments', data),
  update: (id, content) => api.put(`/comments/${id}`, { content }),
  delete: (id) => api.delete(`/comments/${id}`),
  vote: (id, voteType) => api.post(`/comments/${id}/vote`, { voteType }),
};

export default api;