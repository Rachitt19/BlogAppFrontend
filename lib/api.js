import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7777/api';

// Create axios instance with CORS-friendly configuration
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  withCredentials: true, // Include cookies in requests
  timeout: 10000 // 10 second timeout
});

// Request interceptor to add authorization token
apiClient.interceptors.request.use(
  (config) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
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
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token if unauthorized
      if (typeof window !== 'undefined') {
        localStorage.removeItem('authToken');
      }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  signup: async (email, password, displayName) => {
    try {
      const response = await apiClient.post('/auth/signup', {
        email,
        password,
        displayName
      });
      return response.data;
    } catch (error) {
      console.error('Signup error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Signup failed');
    }
  },

  signin: async (email, password) => {
    try {
      const response = await apiClient.post('/auth/signin', {
        email,
        password
      });
      return response.data;
    } catch (error) {
      console.error('Signin error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Signin failed');
    }
  },

  getCurrentUser: async (token) => {
    try {
      const response = await apiClient.get('/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Get user error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to fetch user');
    }
  },

  updateProfile: async (token, displayName, photoURL) => {
    try {
      const response = await apiClient.put('/auth/profile', {
        displayName,
        photoURL
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Update profile error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to update profile');
    }
  }
};
