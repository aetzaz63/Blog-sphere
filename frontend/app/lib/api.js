// frontend/app/lib/api.js
import axios from 'axios';

// API Base URL - make sure this matches your backend port
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds
});

// Add request interceptor to include auth token if available
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Server responded with error status
      console.error('API Error:', error.response.data);
      
      // Handle specific error codes
      if (error.response.status === 401) {
        // Unauthorized - clear token and redirect to login
        localStorage.removeItem('authToken');
        localStorage.removeItem('currentUser');
        window.location.href = '/auth/login';
      }
    } else if (error.request) {
      // Request was made but no response received
      console.error('Network Error:', error.request);
    } else {
      // Something else happened
      console.error('Error:', error.message);
    }
    return Promise.reject(error);
  }
);

// API Methods
export const authAPI = {
  // Register new user
  register: async (userData) => {
    try {
      const response = await axiosInstance.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Login user
  login: async (credentials) => {
    try {
      const response = await axiosInstance.post('/auth/login', credentials);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};

export const userAPI = {
  // Get user profile
  getProfile: async () => {
    try {
      const response = await axiosInstance.get('/users/profile');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Update user profile
  updateProfile: async (userData) => {
    try {
      const response = await axiosInstance.put('/users/profile', userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Change password
  changePassword: async (passwordData) => {
    try {
      const response = await axiosInstance.put('/users/change-password', passwordData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};

export const blogAPI = {
  // Get all blogs
  getAllBlogs: async (params = {}) => {
    try {
      const response = await axiosInstance.get('/blogs', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get single blog
  getBlogById: async (id) => {
    try {
      const response = await axiosInstance.get(`/blogs/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Create blog
  createBlog: async (blogData) => {
    try {
      const response = await axiosInstance.post('/blogs', blogData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Update blog
  updateBlog: async (id, blogData) => {
    try {
      const response = await axiosInstance.put(`/blogs/${id}`, blogData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Delete blog
  deleteBlog: async (id) => {
    try {
      const response = await axiosInstance.delete(`/blogs/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Add rating
  addRating: async (id, rating) => {
    try {
      const response = await axiosInstance.post(`/blogs/${id}/rating`, { rating });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Add comment
  addComment: async (id, text) => {
    try {
      const response = await axiosInstance.post(`/blogs/${id}/comments`, { text });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};

export default axiosInstance;