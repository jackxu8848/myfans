// MyFans API Service - Non-module version for use in HTML files
// This version can be included directly with <script src="api-service.js"></script>

// Get API_BASE_URL at runtime (from config.js or default)
function getAPIBaseURL() {
    // First check if explicitly set
    if (window.API_BASE_URL) {
        return window.API_BASE_URL;
    }
    
    // Auto-detect based on current location
    const hostname = window.location.hostname;
    const protocol = window.location.protocol;
    const port = window.location.port;
    
    if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '') {
        return 'http://localhost:3000/api';
    }
    
    // Production: assume backend on same domain by default
    return `${protocol}//${hostname}${port ? ':' + port : ''}/api`;
}

// Helper function to get auth token
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
        const apiUrl = getAPIBaseURL();
        const response = await fetch(`${apiUrl}${endpoint}`, config);
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

// API Service Object
const API = {
    // Authentication
    auth: {
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
        }
    },

    // Videos
    videos: {
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
        }
    },

    // Bundles
    bundles: {
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
        }
    },

    // Subscriptions
    subscriptions: {
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
        async getMySubscriptions() {
            return apiRequest('/subscriptions/my-subscriptions');
        }
    },

    // Purchases
    purchases: {
        async checkAccess(videoId) {
            return apiRequest(`/purchases/has-access/${videoId}`);
        },
        async getMyPurchases() {
            return apiRequest('/purchases/my-purchases');
        },
        async purchaseVideo(videoId) {
            return apiRequest(`/purchases/video/${videoId}`, {
                method: 'POST',
            });
        },
        async purchaseBundle(bundleId, selectedVideoIds) {
            return apiRequest(`/purchases/bundle/${bundleId}`, {
                method: 'POST',
                body: JSON.stringify({ selectedVideoIds }),
            });
        }
    }
};

