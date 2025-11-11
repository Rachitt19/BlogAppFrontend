import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7777/api';

// Create axios instance with CORS-friendly configuration
const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 10000, // 10 second timeout
  withCredentials: true, // Include cookies and credentials
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest' // Helps with CORS
  }
});

// Request interceptor - add authorization token
apiClient.interceptors.request.use(
  (config) => {
    // Add token to Authorization header if it exists
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 unauthorized - clear token and logout
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
      }
      // Optionally redirect to login
      if (typeof window !== 'undefined' && window.location.pathname !== '/') {
        // window.location.href = '/';
      }
    }
    
    // Log error details for debugging
    console.error('API Error:', {
      status: error.response?.status,
      message: error.response?.data?.message || error.message,
      url: error.config?.url
    });
    
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
      
      // Store token if provided
      if (response.data.token && typeof window !== 'undefined') {
        localStorage.setItem('authToken', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Signup failed';
      console.error('Signup error:', message);
      throw new Error(message);
    }
  },

  signin: async (email, password) => {
    try {
      const response = await apiClient.post('/auth/signin', {
        email,
        password
      });
      
      // Store token if provided
      if (response.data.token && typeof window !== 'undefined') {
        localStorage.setItem('authToken', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Signin failed';
      console.error('Signin error:', message);
      throw new Error(message);
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
      const message = error.response?.data?.message || error.message || 'Failed to fetch user';
      console.error('Get user error:', message);
      throw new Error(message);
    }
  },

  updateProfile: async (token, displayName, photoURL) => {
    try {
      const response = await apiClient.put(
        '/auth/profile',
        { displayName, photoURL },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      // Update stored user info
      if (typeof window !== 'undefined') {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        user.displayName = displayName;
        user.photoURL = photoURL;
        localStorage.setItem('user', JSON.stringify(user));
      }
      
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to update profile';
      console.error('Update profile error:', message);
      throw new Error(message);
    }
  },

  logout: () => {
    // Clear local storage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
    }
  }
};
