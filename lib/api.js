import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8888/api';

// Create axios instance with CORS-friendly configuration
const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest'
  }
});

// Request interceptor - add token
apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
      }
    }

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
    const response = await apiClient.post('/auth/signup', {
      email,
      password,
      displayName
    });

    if (response.data.token && typeof window !== 'undefined') {
      // Normalize user and id storage - backend may return _id or id
      const user = response.data.user || {};
      const userId = user._id || user.id || user.userId || '';

      localStorage.setItem('authToken', response.data.token);
      localStorage.setItem('user', JSON.stringify(user));
      if (userId) localStorage.setItem('userId', userId);
    }

    return response.data;
  },

  signin: async (email, password) => {
    const response = await apiClient.post('/auth/signin', { email, password });

    if (response.data.token && typeof window !== 'undefined') {
      const user = response.data.user || {};
      const userId = user._id || user.id || user.userId || '';

      localStorage.setItem('authToken', response.data.token);
      localStorage.setItem('user', JSON.stringify(user));
      if (userId) localStorage.setItem('userId', userId);
    }

    return response.data;
  },

  getCurrentUser: async (token) => {
    const response = await apiClient.get('/auth/me', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  updateProfile: async (displayName, photoURL) => {
    const response = await apiClient.put('/auth/profile', {
      displayName,
      photoURL
    });

    if (typeof window !== 'undefined') {
      const user = JSON.parse(localStorage.getItem('user'));
      user.displayName = displayName;
      user.photoURL = photoURL;
      localStorage.setItem('user', JSON.stringify(user));
    }

    return response.data;
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      localStorage.removeItem('userId');
    }
  }
};

// POSTS API (fixed)
export const postsAPI = {
  getAllPosts: async (page = 1, limit = 10, category = null, search = null, sort = '-createdAt') => {
    let url = `/posts?page=${page}&limit=${limit}&sort=${sort}`;

    if (category && category !== 'all') url += `&category=${category}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;

    const res = await apiClient.get(url);
    return res.data;
  },

  getPost: async (postId) => {
    const res = await apiClient.get(`/posts/${postId}`);
    return res.data;
  },

  createPost: async (title, content, category, tags = [], image = null) => {
    const res = await apiClient.post('/posts', {
      title,
      content,
      category,
      tags,
      image
    });
    return res.data;
  },

  updatePost: async (postId, title, content, category, tags = [], image = null) => {
    const res = await apiClient.put(`/posts/${postId}`, {
      title,
      content,
      category,
      tags,
      image
    });
    return res.data;
  },

  deletePost: async (postId) => {
    const res = await apiClient.delete(`/posts/${postId}`);
    return res.data;
  },

  likePost: async (postId) => {
    const res = await apiClient.post(`/posts/${postId}/like`);
    return res.data;
  },

  addComment: async (postId, content) => {
    const res = await apiClient.post(`/posts/${postId}/comments`, { content });
    return res.data;
  },

  deleteComment: async (postId, commentId) => {
    const res = await apiClient.delete(`/posts/${postId}/comments/${commentId}`);
    return res.data;
  },

  getUserPosts: async (userId, page = 1, limit = 10) => {
    const res = await apiClient.get(`/posts/users/${userId}/posts?page=${page}&limit=${limit}`);
    return res.data;
  },

  getLikedPosts: async (userId, page = 1, limit = 10) => {
    const res = await apiClient.get(`/posts/users/${userId}/liked-posts?page=${page}&limit=${limit}`);
    return res.data;
  }
};

// COMMUNITIES API
export const communitiesAPI = {
  getUserCommunities: async (userId) => {
    try {
      const res = await apiClient.get(`/communities/user/${userId}`);
      return res.data;
    } catch (error) {
      console.error('Get user communities error:', error);
      return { communities: [] };
    }
  },

  getAllCommunities: async (page = 1, limit = 10) => {
    try {
      const res = await apiClient.get(`/communities?page=${page}&limit=${limit}`);
      return res.data;
    } catch (error) {
      console.error('Get communities error:', error);
      return { communities: [] };
    }
  },

  getCommunity: async (communityId) => {
    try {
      const res = await apiClient.get(`/communities/${communityId}`);
      return res.data;
    } catch (error) {
      console.error('Get community error:', error);
      throw error;
    }
  },

  joinCommunity: async (communityId) => {
    try {
      const res = await apiClient.post(`/communities/${communityId}/join`);
      return res.data;
    } catch (error) {
      console.error('Join community error:', error);
      throw error;
    }
  }
};
