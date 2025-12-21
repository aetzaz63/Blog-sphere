// frontend/app/lib/api.js
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export async function apiRequest(endpoint, method = "GET", body = null, token = null) {
  const headers = {
    "Content-Type": "application/json",
  };

  // Add token to headers if provided
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const options = {
    method,
    headers,
  };

  if (body && (method === "POST" || method === "PUT" || method === "PATCH")) {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
    
    // Parse response as JSON
    let data;
    try {
      data = await response.json();
    } catch (parseError) {
      throw new Error(`Failed to parse server response: ${response.statusText}`);
    }

    if (!response.ok) {
      // Handle backend error format - extract proper error message
      let errorMessage = data.message;
      
      // Handle validation errors array format
      if (data.errors && Array.isArray(data.errors)) {
        errorMessage = data.errors.map(err => err.message).join(', ');
      }
      
      // Fallback to generic error
      if (!errorMessage) {
        errorMessage = `Request failed with status ${response.status}`;
      }
      
      throw new Error(errorMessage);
    }

    return data;
  } catch (error) {
    // If it's a network error, provide helpful message
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Unable to connect to server. Please check if the backend is running.');
    }
    
    // Re-throw the original error (don't log it here, let the component handle it)
    throw error;
  }
}

// Auth API functions
export const authAPI = {
  register: async (userData) => {
    return await apiRequest("/auth/register", "POST", {
      username: userData.username,
      email: userData.email,
      password: userData.password,
    });
  },

  login: async (credentials) => {
    return await apiRequest("/auth/login", "POST", {
      email: credentials.email,
      password: credentials.password,
    });
  },
};

// User API functions
export const userAPI = {
  getProfile: async (token) => {
    return await apiRequest("/users/profile", "GET", null, token);
  },

  updateProfile: async (userData, token) => {
    return await apiRequest("/users/profile", "PUT", userData, token);
  },

  changePassword: async (passwordData, token) => {
    return await apiRequest("/users/change-password", "PUT", passwordData, token);
  },
};

// Blog API functions
export const blogAPI = {
  getAllBlogs: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return await apiRequest(`/blogs${queryString ? `?${queryString}` : ""}`, "GET");
  },

  getBlogById: async (id) => {
    return await apiRequest(`/blogs/${id}`, "GET");
  },

  createBlog: async (blogData, token) => {
    return await apiRequest("/blogs", "POST", blogData, token);
  },

  updateBlog: async (id, blogData, token) => {
    return await apiRequest(`/blogs/${id}`, "PUT", blogData, token);
  },

  deleteBlog: async (id, token) => {
    return await apiRequest(`/blogs/${id}`, "DELETE", null, token);
  },

  addRating: async (id, rating, token = null) => {
    return await apiRequest(`/blogs/${id}/rating`, "POST", { rating }, token);
  },

  addComment: async (id, text, token) => {
    return await apiRequest(`/blogs/${id}/comments`, "POST", { text }, token);
  },

  updateComment: async (blogId, commentId, text, token) => {
    return await apiRequest(`/blogs/${blogId}/comments/${commentId}`, "PUT", { text }, token);
  },

  deleteComment: async (blogId, commentId, token) => {
    return await apiRequest(`/blogs/${blogId}/comments/${commentId}`, "DELETE", null, token);
  },
};

// Follow API functions
export const followAPI = {
  followUser: async (userId, token) => {
    return await apiRequest(`/follow/${userId}`, "POST", null, token);
  },

  unfollowUser: async (userId, token) => {
    return await apiRequest(`/follow/${userId}`, "DELETE", null, token);
  },

  getFollowing: async (token) => {
    return await apiRequest("/follow/following", "GET", null, token);
  },

  getFollowers: async (token) => {
    return await apiRequest("/follow/followers", "GET", null, token);
  },

  getFeed: async (params = {}, token) => {
    const queryString = new URLSearchParams(params).toString();
    return await apiRequest(`/follow/feed${queryString ? `?${queryString}` : ""}`, "GET", null, token);
  },

  checkFollowStatus: async (userId, token) => {
    return await apiRequest(`/follow/check/${userId}`, "GET", null, token);
  },
};

// Notification API functions
export const notificationAPI = {
  getNotifications: async (params = {}, token) => {
    const queryString = new URLSearchParams(params).toString();
    return await apiRequest(`/notifications${queryString ? `?${queryString}` : ""}`, "GET", null, token);
  },

  markAsRead: async (id, token) => {
    return await apiRequest(`/notifications/${id}/read`, "PUT", null, token);
  },

  markAllAsRead: async (token) => {
    return await apiRequest("/notifications/read-all", "PUT", null, token);
  },

  deleteNotification: async (id, token) => {
    return await apiRequest(`/notifications/${id}`, "DELETE", null, token);
  },

  deleteAllNotifications: async (token) => {
    return await apiRequest("/notifications", "DELETE", null, token);
  },

  getUnreadCount: async (token) => {
    return await apiRequest("/notifications/unread/count", "GET", null, token);
  },
};

// Admin API functions
export const adminAPI = {
  getStats: async (token) => {
    return await apiRequest("/admin/stats", "GET", null, token);
  },

  getAllUsers: async (params = {}, token) => {
    const queryString = new URLSearchParams(params).toString();
    return await apiRequest(`/admin/users${queryString ? `?${queryString}` : ""}`, "GET", null, token);
  },

  getUserDetails: async (id, token) => {
    return await apiRequest(`/admin/users/${id}`, "GET", null, token);
  },

  toggleUserStatus: async (id, token) => {
    return await apiRequest(`/admin/users/${id}/toggle-status`, "PUT", null, token);
  },

  getAllBlogs: async (params = {}, token) => {
    const queryString = new URLSearchParams(params).toString();
    return await apiRequest(`/admin/blogs${queryString ? `?${queryString}` : ""}`, "GET", null, token);
  },

  getBlogDetails: async (id, token) => {
    return await apiRequest(`/admin/blogs/${id}`, "GET", null, token);
  },

  toggleBlogStatus: async (id, token) => {
    return await apiRequest(`/admin/blogs/${id}/toggle-status`, "PUT", null, token);
  },
};