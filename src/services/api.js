// src/services/api.js
import axios from 'axios';
import { CONFIG } from '../config';

// Create axios instance - no auth headers needed with simplified backend
const apiClient = axios.create({
  baseURL: CONFIG.API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: CONFIG.API_TIMEOUT,
});

// Authentication API ; selon chaque operation
export const authAPI = {
  // Register a new user
  register: async (username, email, password) => {
    try {
      const response = await apiClient.post('/auth/register', {
        username,
        email,
        password,
      });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Registration failed',
      };
    }
  },

  // Login user
  login: async (email, password) => {
    try {
      const response = await apiClient.post('/auth/login', {
        email,
        password,
      });
      // Backend returns user info: { id, username, email }
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Login failed',
      };
    }
  },
};

// Warnings API
export const warningsAPI = {
  // Get all approved warnings
  getAll: async () => {
    try {
      const response = await apiClient.get('/warnings');
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to fetch warnings',
      };
    }
  },

  // Get specific warning by ID
  getById: async (id) => {
    try {
      const response = await apiClient.get(`/warnings/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to fetch warning',
      };
    }
  },

  // Search warnings
  search: async (searchTerm = '', categoryId = '') => {
    try {
      const params = {};
      if (searchTerm) params.searchTerm = searchTerm;
      if (categoryId) params.categoryId = categoryId;
      
      const response = await apiClient.get('/warnings/search', { params });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to search warnings',
      };
    }
  },

  // Create new warning (userId passed in body for simplified backend without JWT)
  create: async (title, description, warningSigns, categoryId, userId) => {
    try {
      console.log('Creating warning with:', { title, description, warningSigns, categoryId, userId });
      const response = await apiClient.post('/warnings', {
        title,
        description,
        warningSigns, // Required by backend
        categoryId,
        userId, // Include userId in body since no JWT
      });
      return { success: true, data: response.data };
    } catch (error) {
      console.log('Error response:', error.response?.data);
      // Handle validation errors from backend
      const errorData = error.response?.data;
      let errorMessage = 'Failed to create warning';
      if (errorData?.errors) {
        // Extract validation error messages
        const messages = Object.values(errorData.errors).flat();
        errorMessage = messages.join(', ');
      } else if (errorData?.error) {
        errorMessage = errorData.error;
      } else if (error.message) {
        errorMessage = error.message;
      }
      return {
        success: false,
        error: errorMessage,
      };
    }
  },
};

// Categories API
export const categoriesAPI = {
  // Get all categories
  getAll: async () => {
    try {
      const response = await apiClient.get('/categories');
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to fetch categories',
      };
    }
  },
};

// Comments API
export const commentsAPI = {
  // Get comments for a warning
  getByWarningId: async (warningId) => {
    try {
      const response = await apiClient.get(`/warnings/${warningId}/comments`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to fetch comments',
      };
    }
  },

  // Add comment to a warning (userId passed in body for simplified backend without JWT)
  add: async (warningId, content, userId) => {
    try {
      const response = await apiClient.post(`/warnings/${warningId}/comments`, {
        text: content, // Backend expects 'text' not 'content'
        userId, // Include userId in body since no JWT
      });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to add comment',
      };
    }
  },
};

// Admin API
export const adminAPI = {
  // Verify if user is admin
  verifyAdmin: async (userId) => {
    try {
      const response = await apiClient.get(`/admin/verify/${userId}`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to verify admin',
      };
    }
  },

  // Get all warnings (admin only)
  getAllWarnings: async (userId) => {
    try {
      const response = await apiClient.get(`/admin/warnings?userId=${userId}`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to fetch warnings',
      };
    }
  },

  // Delete a warning (admin only)
  deleteWarning: async (warningId, userId) => {
    try {
      const response = await apiClient.delete(`/admin/warnings/${warningId}?userId=${userId}`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to delete warning',
      };
    }
  },

  // Update a warning (admin only)
  updateWarning: async (warningId, warningData, userId) => {
    try {
      const response = await apiClient.put(`/admin/warnings/${warningId}?userId=${userId}`, warningData);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to update warning',
      };
    }
  },

  // Delete a comment (admin only)
  deleteComment: async (commentId, userId) => {
    try {
      const response = await apiClient.delete(`/admin/comments/${commentId}?userId=${userId}`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to delete comment',
      };
    }
  },

  // Approve a warning (admin only)
  approveWarning: async (warningId, userId) => {
    try {
      const response = await apiClient.put(`/admin/warnings/${warningId}/approve?userId=${userId}`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to approve warning',
      };
    }
  },

  // Reject a warning (admin only)
  rejectWarning: async (warningId, userId) => {
    try {
      const response = await apiClient.put(`/admin/warnings/${warningId}/reject?userId=${userId}`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to reject warning',
      };
    }
  },
};
