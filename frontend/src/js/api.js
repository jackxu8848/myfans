// MyFans API Service
// Replace all localStorage calls with API calls using this service

const API_BASE_URL = process.env.API_URL || 'http://localhost:3000/api';

// Helper function to get auth token from localStorage
function getAuthToken() {
  return localStorage.getItem('myfans_auth_token');
}

// Helper function to save auth token
function saveAuthToken(token) {
  localStorage.setItem('myfans_auth_token', token);
}

// Helper function to remove auth token
function removeAuthToken() {
  localStorage.removeItem('myfans_auth_token');
}

// Helper function to make API requests
async function apiRequest(endpoint, options = {}) {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const config = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'API request failed');
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

// Authentication API
export const authAPI = {
  async register(email, password, name) {
    const response = await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });
    if (response.token) {
      saveAuthToken(response.token);
    }
    return response;
  },

  async login(email, password) {
    const response = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (response.token) {
      saveAuthToken(response.token);
    }
    return response;
  },

  async getCurrentUser() {
    return apiRequest('/auth/me');
  },

  async becomeCreator() {
    const user = await this.getCurrentUser();
    return apiRequest(`/auth/users/${user.id}/become-creator`, {
      method: 'PUT',
    });
  },

  logout() {
    removeAuthToken();
    window.location.href = 'login.html';
  },
};

// Videos API
export const videosAPI = {
  async getAllVideos() {
    return apiRequest('/videos');
  },

  async getVideoById(id) {
    return apiRequest(`/videos/${id}`);
  },

  async getVideosByCreator(creatorId) {
    return apiRequest(`/videos/creator/${creatorId}`);
  },

  async createVideo(videoData) {
    return apiRequest('/videos', {
      method: 'POST',
      body: JSON.stringify(videoData),
    });
  },

  async updateVideo(id, videoData) {
    return apiRequest(`/videos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(videoData),
    });
  },

  async deleteVideo(id) {
    return apiRequest(`/videos/${id}`, {
      method: 'DELETE',
    });
  },
};

// Purchases API
export const purchasesAPI = {
  async checkAccess(videoId) {
    return apiRequest(`/purchases/has-access/${videoId}`);
  },

  async purchaseVideo(videoId) {
    return apiRequest(`/purchases/video/${videoId}`, {
      method: 'POST',
    });
  },

  async getMyPurchases() {
    return apiRequest('/purchases/my-purchases');
  },
};

// Bundles API
export const bundlesAPI = {
  async getCreatorBundles(creatorId) {
    return apiRequest(`/bundles/creator/${creatorId}`);
  },

  async createBundle(bundleData) {
    return apiRequest('/bundles', {
      method: 'POST',
      body: JSON.stringify(bundleData),
    });
  },

  async updateBundle(id, bundleData) {
    return apiRequest(`/bundles/${id}`, {
      method: 'PUT',
      body: JSON.stringify(bundleData),
    });
  },

  async deleteBundle(id) {
    return apiRequest(`/bundles/${id}`, {
      method: 'DELETE',
    });
  },

  async purchaseBundle(id, selectedVideoIds) {
    return apiRequest(`/bundles/${id}/purchase`, {
      method: 'POST',
      body: JSON.stringify({ selectedVideoIds }),
    });
  },
};

// Subscriptions API
export const subscriptionsAPI = {
  async getCreatorSubscription(creatorId) {
    return apiRequest(`/subscriptions/creator/${creatorId}`);
  },

  async createSubscription(monthlyPrice) {
    return apiRequest('/subscriptions', {
      method: 'POST',
      body: JSON.stringify({ monthlyPrice }),
    });
  },

  async updateSubscription(id, subscriptionData) {
    return apiRequest(`/subscriptions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(subscriptionData),
    });
  },

  async subscribe(subscriptionId) {
    return apiRequest(`/subscriptions/${subscriptionId}/subscribe`, {
      method: 'POST',
    });
  },

  async unsubscribe(subscriptionId) {
    return apiRequest(`/subscriptions/${subscriptionId}/unsubscribe`, {
      method: 'DELETE',
    });
  },

  async getMySubscriptions() {
    return apiRequest('/subscriptions/my-subscriptions');
  },
};

// Export default API object
export default {
  auth: authAPI,
  videos: videosAPI,
  purchases: purchasesAPI,
  bundles: bundlesAPI,
  subscriptions: subscriptionsAPI,
};

