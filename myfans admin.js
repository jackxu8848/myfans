// YouTube Data API v3 Key - Optional, not required for basic functionality
// The app uses oEmbed API which doesn't require an API key
// Get one at: https://console.cloud.google.com/apis/credentials if you want additional features
const YOUTUBE_API_KEY = '';

// YouTube URL patterns
const YOUTUBE_URL_PATTERNS = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/watch\?.*v=([a-zA-Z0-9_-]{11})/
];

// Extract video ID from YouTube URL
function extractVideoId(url) {
    for (const pattern of YOUTUBE_URL_PATTERNS) {
        const match = url.match(pattern);
        if (match && match[1]) {
            return match[1];
        }
    }
    return null;
}

// Validate YouTube URL format
function isValidYouTubeUrl(url) {
    return extractVideoId(url) !== null;
}

// Normalize YouTube URL to ensure it has proper protocol and domain
function normalizeYouTubeUrl(url, videoId) {
    if (!url || !videoId) {
        // Fallback: construct URL from video ID
        return `https://www.youtube.com/watch?v=${videoId}`;
    }
    
    // If URL already starts with http:// or https://, check if it's a valid YouTube URL
    if (url.match(/^https?:\/\//i)) {
        // If it's already a proper YouTube URL, use it as-is
        if (url.match(/^https?:\/\/(www\.)?youtube\.com/i) || url.match(/^https?:\/\/youtu\.be/i)) {
            return url;
        }
        // If it has protocol but wrong domain, reconstruct from video ID
        return `https://www.youtube.com/watch?v=${videoId}`;
    }
    
    // If URL starts with youtube.com (without www), normalize to www.youtube.com
    if (url.match(/^youtube\.com/i)) {
        return `https://www.${url}`;
    }
    
    // If URL starts with www.youtube.com, add https://
    if (url.match(/^www\.youtube\.com/i)) {
        return `https://${url}`;
    }
    
    // If URL starts with youtu.be, convert to full format
    if (url.match(/^youtu\.be\//i)) {
        return `https://www.youtube.com/watch?v=${videoId}`;
    }
    
    // For any other format (or malformed URL), construct clean URL from video ID
    // This handles cases where URL is just "youtube.com/watch?v=..." without proper prefix
    return `https://www.youtube.com/watch?v=${videoId}`;
}

// Get video info using YouTube oEmbed API (works for unlisted videos)
async function getVideoInfoViaOEmbed(videoId, originalUrl) {
    try {
        // Always use a clean URL with just the video ID for oEmbed API
        // The oEmbed API doesn't need query parameters and they can cause issues
        // We preserve the original URL for storage, but use a clean URL for validation
        const cleanYouTubeUrl = `https://www.youtube.com/watch?v=${videoId}`;
        
        // Properly encode the URL for the oEmbed API call
        const encodedUrl = encodeURIComponent(cleanYouTubeUrl);
        const oembedUrl = `https://www.youtube.com/oembed?url=${encodedUrl}&format=json`;
        
        const response = await fetch(oembedUrl);
        
        if (!response.ok) {
            // Try to get error details from response
            let errorMessage = 'Video is private, restricted, or not found';
            try {
                const errorText = await response.text();
                // Sometimes YouTube returns HTML error pages
                if (errorText.includes('404') || errorText.includes('Not Found')) {
                    errorMessage = 'Video not found';
                } else if (errorText.includes('403') || errorText.includes('Forbidden') || errorText.includes('private')) {
                    errorMessage = 'Video is private or restricted';
                }
            } catch (e) {
                // If we can't parse the error, use status-based messages
                if (response.status === 401 || response.status === 403) {
                    errorMessage = 'Video is private or restricted';
                } else if (response.status === 404) {
                    errorMessage = 'Video not found';
                } else {
                    errorMessage = `Failed to fetch video information (${response.status})`;
                }
            }
            throw new Error(errorMessage);
        }
        
        // Parse the JSON response
        let data;
        try {
            data = await response.json();
        } catch (parseError) {
            throw new Error('Invalid response from YouTube. The video may not be accessible.');
        }
        
        // Validate that we got the required data
        if (!data || !data.title || !data.thumbnail_url) {
            throw new Error('Video information is incomplete. The video may not be accessible.');
        }
        
        return {
            title: data.title,
            thumbnail: data.thumbnail_url,
            author: data.author_name || 'Unknown',
            success: true
        };
    } catch (error) {
        // Re-throw network errors or API errors with more context
        if (error instanceof TypeError && error.message.includes('fetch')) {
            throw new Error('Network error. Please check your connection and try again.');
        }
        throw error;
    }
}


// Show error message
function showError(message) {
    const errorDiv = document.getElementById('errorMessage');
    const successDiv = document.getElementById('successMessage');
    
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    successDiv.style.display = 'none';
}

// Show success message
function showSuccess(message) {
    const errorDiv = document.getElementById('errorMessage');
    const successDiv = document.getElementById('successMessage');
    
    successDiv.textContent = message;
    successDiv.style.display = 'block';
    errorDiv.style.display = 'none';
}

// Hide messages
function hideMessages() {
    document.getElementById('errorMessage').style.display = 'none';
    document.getElementById('successMessage').style.display = 'none';
}

// Display video preview
function displayVideoPreview(videoInfo, videoId, videoUrl, price) {
    const previewSection = document.getElementById('videoPreview');
    const thumbnailImg = document.getElementById('videoThumbnail');
    const thumbnailLink = document.getElementById('videoThumbnailLink');
    const titleElement = document.getElementById('videoTitle');
    const titleLink = document.getElementById('videoTitleLink');
    const videoIdElement = document.getElementById('videoId');
    const statusElement = document.getElementById('videoStatus');
    const priceElement = document.getElementById('videoPriceDisplay');
    
    // Set links
    thumbnailLink.href = videoUrl;
    titleLink.href = videoUrl;
    
    // Set content
    thumbnailImg.src = videoInfo.thumbnail;
    thumbnailImg.alt = videoInfo.title;
    titleElement.textContent = videoInfo.title;
    videoIdElement.textContent = `ID: ${videoId}`;
    statusElement.textContent = 'Accessible';
    
    // Set price
    const priceValue = parseFloat(price) || 0;
    if (priceValue === 0) {
        priceElement.textContent = 'FREE';
        priceElement.className = 'video-price-display price-free';
    } else {
        priceElement.textContent = `$${priceValue.toFixed(2)}`;
        priceElement.className = 'video-price-display price-paid';
    }
    
    previewSection.style.display = 'block';
}

// Add video to list via API
async function addVideoToList(videoId, videoInfo, videoUrl, price) {
    try {
        const priceValue = parseFloat(price) || 0;
        
        // Create video via API
        const response = await API.videos.createVideo({
            youtubeVideoId: videoId,
            youtubeUrl: videoUrl,
            title: videoInfo.title,
            thumbnailUrl: videoInfo.thumbnail_url || videoInfo.thumbnail,
            price: priceValue
        });
        
        // Reload videos list from API
        await renderVideosList();
        
        // Hide preview
        document.getElementById('videoPreview').style.display = 'none';
        
        showSuccess('Video added successfully!');
    } catch (error) {
        console.error('Error adding video:', error);
        
        // Check if error is about not being a creator
        if (error.message.includes('Creator') || error.message.includes('403')) {
            showError('You must be a creator to add videos. Please ensure you are in creator mode.');
            // Try to become creator automatically
            try {
                await API.auth.becomeCreator();
                showError('Switched to creator mode. Please try adding the video again.');
            } catch (creatorError) {
                showError('Failed to switch to creator mode: ' + creatorError.message);
            }
        } else {
            showError('Failed to add video: ' + error.message);
        }
        throw error; // Re-throw to prevent form reset
    }
}

// Get stored videos from API
async function getStoredVideos() {
    try {
        const user = await API.auth.getCurrentUser();
        return await API.videos.getVideosByCreator(user.id);
    } catch (error) {
        console.error('Error fetching videos:', error);
        return [];
    }
}

// Save videos to API (not used directly, videos are saved via createVideo API)
function saveVideosToStorage(videos) {
    // Videos are saved directly via API.createVideo, so this is a no-op
    // Keeping for compatibility but it doesn't do anything
}

// Render videos list
async function renderVideosList() {
    const videosList = document.getElementById('videosList');
    const videos = await getStoredVideos();
    
    if (videos.length === 0) {
        videosList.innerHTML = '<p class="empty-message">No videos added yet. Add your first video above!</p>';
        return;
    }
    
    videosList.innerHTML = videos.map(video => {
        const videoUrl = video.youtube_url || video.url || `https://www.youtube.com/watch?v=${video.youtube_video_id || video.id}`;
        // Ensure price is a number (database might return it as string)
        let price = 0;
        if (video.price !== undefined && video.price !== null) {
            price = typeof video.price === 'string' ? parseFloat(video.price) : Number(video.price);
            if (isNaN(price)) price = 0;
        }
        const priceDisplay = price === 0 ? 'FREE' : `$${price.toFixed(2)}`;
        const priceClass = price === 0 ? 'price-free' : 'price-paid';
        const videoId = video.id; // Use database UUID
        const thumbnail = video.thumbnail_url || video.thumbnail;
        return `
        <div class="video-card" data-video-id="${videoId}">
            <a href="${videoUrl}" target="_blank" rel="noopener noreferrer" class="video-card-link">
                <img src="${thumbnail}" alt="${video.title}" class="video-card-thumbnail">
            </a>
            <div class="video-card-info">
                <a href="${videoUrl}" target="_blank" rel="noopener noreferrer" class="video-card-title-link">
                    <h3 class="video-card-title">${video.title}</h3>
                </a>
                <div class="video-card-price ${priceClass}">${priceDisplay}</div>
                <div class="video-card-meta">
                    <span class="video-card-id">${video.youtube_video_id || videoId}</span>
                    <div class="video-card-actions">
                        <button class="edit-btn" onclick="editVideoPrice('${videoId}')">Edit Price</button>
                        <button class="delete-btn" onclick="deleteVideo('${videoId}')">Delete</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    }).join('');
    
    // Note: Creators can click on video links/thumbnails to open videos directly
    // The existing links in the HTML already handle this, so creators have full access
}

// Delete video
async function deleteVideo(videoId) {
    if (confirm('Are you sure you want to delete this video?')) {
        try {
            await API.videos.deleteVideo(videoId);
            await renderVideosList();
            showSuccess('Video deleted successfully!');
            setTimeout(hideMessages, 3000);
        } catch (error) {
            console.error('Error deleting video:', error);
            showError('Failed to delete video: ' + error.message);
        }
    }
}

// Authentication Check
async function checkAuth() {
    const token = localStorage.getItem('myfans_auth_token');
    if (!token) {
        window.location.href = 'login.html';
        return null;
    }
    
    try {
        const user = await API.auth.getCurrentUser();
        // Store user info for compatibility
        localStorage.setItem('myfans_current_user', JSON.stringify(user));
        return user;
    } catch (error) {
        console.error('Auth check failed:', error);
        // Remove invalid token
        localStorage.removeItem('myfans_auth_token');
        window.location.href = 'login.html';
        return null;
    }
}

// Logout
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        API.auth.logout();
    }
}

// Mode toggle
function handleModeToggle() {
    const modeToggle = document.getElementById('modeToggle');
    if (!modeToggle.checked) {
        // Viewer mode
        window.location.href = 'index.html';
    }
    // Creator mode (already on admin page)
}

// Edit video price
async function editVideoPrice(videoId) {
    try {
        const video = await API.videos.getVideoById(videoId);
        if (!video) {
            showError('Video not found');
            return;
        }
        
        const newPrice = prompt(`Enter new price for "${video.title}"`, video.price || 0);
        
        if (newPrice !== null) {
            const priceValue = parseFloat(newPrice);
            if (!isNaN(priceValue) && priceValue >= 0) {
                await API.videos.updateVideo(videoId, { price: priceValue });
                await renderVideosList();
                showSuccess('Video price updated successfully!');
                setTimeout(hideMessages, 3000);
            } else {
                showError('Please enter a valid price (0 or greater).');
            }
        }
    } catch (error) {
        console.error('Error updating video price:', error);
        showError('Failed to update video price: ' + error.message);
    }
}

// Make functions available globally
window.deleteVideo = deleteVideo;
window.editVideoPrice = editVideoPrice;

// Handle form submission
document.addEventListener('DOMContentLoaded', async function() {
    // Check authentication
    const user = await checkAuth();
    if (!user) return;
    
    // Check if user is a creator, if not, become one automatically
    if (!user.isCreator && !user.is_creator) {
        try {
            await API.auth.becomeCreator();
            // Refresh user info
            const updatedUser = await API.auth.getCurrentUser();
            localStorage.setItem('myfans_current_user', JSON.stringify(updatedUser));
        } catch (error) {
            console.error('Error becoming creator:', error);
            showError('Failed to switch to creator mode: ' + error.message);
        }
    }
    
    // Logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }
    
    // Mode toggle
    const modeToggle = document.getElementById('modeToggle');
    if (modeToggle) {
        modeToggle.checked = true; // Default to creator mode
        modeToggle.addEventListener('change', handleModeToggle);
    }
    
    const form = document.getElementById('videoForm');
    const addButton = document.getElementById('addButton');
    const btnText = addButton.querySelector('.btn-text');
    const btnLoader = addButton.querySelector('.btn-loader');
    
    // Render existing videos on load
    renderVideosList().catch(err => {
        console.error('Error loading videos:', err);
        showError('Failed to load videos. Please refresh the page.');
    });
    
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const urlInput = document.getElementById('youtubeUrl');
        const url = urlInput.value.trim();
        
        // Hide previous messages
        hideMessages();
        document.getElementById('videoPreview').style.display = 'none';
        
        // Validate URL format
        if (!isValidYouTubeUrl(url)) {
            showError('Please enter a valid YouTube URL.');
            return;
        }
        
        const videoId = extractVideoId(url);
        
        // Double-check video ID was extracted
        if (!videoId) {
            showError('Please enter a valid YouTube URL.');
            return;
        }
        
        // Disable button and show loading
        addButton.disabled = true;
        btnText.style.display = 'none';
        btnLoader.style.display = 'inline';
        
        try {
            // Get price
            const priceInput = document.getElementById('videoPrice');
            const price = priceInput.value || '0';
            const priceValue = parseFloat(price);
            
            // Validate price (must be >= 0)
            if (isNaN(priceValue) || priceValue < 0) {
                showError('Please enter a valid price (0 or greater).');
                addButton.disabled = false;
                btnText.style.display = 'inline';
                btnLoader.style.display = 'none';
                return;
            }
            
            // Get video info via oEmbed (this validates accessibility)
            // We use a clean URL with just the video ID for oEmbed API
            // The original URL is preserved for storage
            const videoInfo = await getVideoInfoViaOEmbed(videoId, url);
            
            // Normalize the URL to ensure it has proper protocol and domain
            const normalizedUrl = normalizeYouTubeUrl(url, videoId);
            
            // If we got here, the video is accessible
            // Display preview
            displayVideoPreview(videoInfo, videoId, normalizedUrl, priceValue);
            
            // Add to list (with normalized URL) - this now uses API
            await addVideoToList(videoId, videoInfo, normalizedUrl, priceValue);
            
            // Reset form
            urlInput.value = '';
            priceInput.value = '0';
            
        } catch (error) {
            if (error.message.includes('private') || error.message.includes('restricted') || error.message.includes('not found')) {
                showError('This video is private, restricted, or not found. Please use a public or unlisted video that can be accessed.');
            } else {
                showError('Failed to fetch video information: ' + error.message + '. Please check the URL and try again.');
            }
        } finally {
            // Re-enable button
            addButton.disabled = false;
            btnText.style.display = 'inline';
            btnLoader.style.display = 'none';
        }
    });

    // Pricing configuration handlers
    initializePricingSettings();
});

// Pricing Settings Functions

// Get stored bundles from API
async function getStoredBundles() {
    try {
        const user = await API.auth.getCurrentUser();
        return await API.bundles.getCreatorBundles(user.id);
    } catch (error) {
        console.error('Error fetching bundles:', error);
        return [];
    }
}

// Save bundles to API (not used directly, bundles are saved via createBundle API)
function saveBundlesToStorage(bundles) {
    // Bundles are saved directly via API.createBundle, so this is a no-op
}

// Get stored membership price from API
async function getMembershipPrice() {
    try {
        const user = await API.auth.getCurrentUser();
        const subscription = await API.subscriptions.getCreatorSubscription(user.id);
        return subscription ? subscription.monthly_price : null;
    } catch (error) {
        console.error('Error fetching subscription:', error);
        return null;
    }
}

// Save membership price to API (creates/updates subscription)
async function saveMembershipPrice(price) {
    try {
        const user = await API.auth.getCurrentUser();
        const existing = await API.subscriptions.getCreatorSubscription(user.id);
        
        if (existing) {
            // Update existing subscription
            await API.subscriptions.updateSubscription(existing.id, { monthlyPrice: price });
        } else {
            // Create new subscription
            await API.subscriptions.createSubscription(price);
        }
    } catch (error) {
        console.error('Error saving subscription:', error);
        throw error;
    }
}

// Render bundles list
async function renderBundlesList() {
    const bundlesList = document.getElementById('bundlesList');
    const bundles = await getStoredBundles();
    
    if (bundles.length === 0) {
        bundlesList.innerHTML = '<p class="empty-bundles">No bundles configured yet.</p>';
        return;
    }
    
    bundlesList.innerHTML = bundles.map((bundle) => {
        let bundlePrice = 0;
        if (bundle.price !== undefined && bundle.price !== null) {
            bundlePrice = typeof bundle.price === 'string' ? parseFloat(bundle.price) : Number(bundle.price);
            if (isNaN(bundlePrice)) bundlePrice = 0;
        }
        return `
        <div class="bundle-item">
            <div class="bundle-info">
                <span class="bundle-badge">Bundle</span>
                <span class="bundle-details">Select any <strong>${bundle.video_count}</strong> videos for <strong>$${bundlePrice.toFixed(2)}</strong></span>
            </div>
            <div class="bundle-actions">
                <button class="edit-bundle-btn" onclick="editBundle('${bundle.id}')">Edit</button>
                <button class="delete-bundle-btn" onclick="deleteBundle('${bundle.id}')">Delete</button>
            </div>
        </div>
    `;
    }).join('');
}

// Edit bundle
async function editBundle(bundleId) {
    try {
        const bundles = await getStoredBundles();
        const bundle = bundles.find(b => b.id === bundleId);
        
        if (!bundle) {
            showError('Bundle not found');
            return;
        }
        
        const newCount = prompt(`Enter number of videos for bundle:`, bundle.video_count);
        if (newCount === null) return;
        
        const newPrice = prompt(`Enter bundle price:`, bundle.price);
        if (newPrice === null) return;
        
        const countValue = parseInt(newCount);
        const priceValue = parseFloat(newPrice);
        
        if (isNaN(countValue) || countValue < 2) {
            showError('Bundle must include at least 2 videos.');
            return;
        }
        
        if (isNaN(priceValue) || priceValue <= 0) {
            showError('Bundle price must be greater than 0.');
            return;
        }
        
        await API.bundles.updateBundle(bundleId, {
            videoCount: countValue,
            price: priceValue
        });
        
        await renderBundlesList();
        showSuccess('Bundle updated successfully!');
        setTimeout(hideMessages, 3000);
    } catch (error) {
        console.error('Error updating bundle:', error);
        showError('Failed to update bundle: ' + error.message);
    }
}

// Delete bundle
async function deleteBundle(bundleId) {
    if (confirm('Are you sure you want to delete this bundle?')) {
        try {
            await API.bundles.deleteBundle(bundleId);
            await renderBundlesList();
            showSuccess('Bundle deleted successfully!');
            setTimeout(hideMessages, 3000);
        } catch (error) {
            console.error('Error deleting bundle:', error);
            showError('Failed to delete bundle: ' + error.message);
        }
    }
}

// Make deleteBundle and editBundle available globally
window.deleteBundle = deleteBundle;
window.editBundle = editBundle;

// Render membership display
async function renderMembershipDisplay() {
    const membershipDisplay = document.getElementById('membershipDisplay');
    const price = await getMembershipPrice();
    
    if (price === null) {
        membershipDisplay.innerHTML = '<p class="empty-membership">No membership price set yet.</p>';
        return;
    }
    
    const user = await API.auth.getCurrentUser();
    const subscription = await API.subscriptions.getCreatorSubscription(user.id);
    const subscriptionId = subscription ? subscription.id : null;
    
    // Ensure price is a number
    let membershipPrice = 0;
    if (price !== undefined && price !== null) {
        membershipPrice = typeof price === 'string' ? parseFloat(price) : Number(price);
        if (isNaN(membershipPrice)) membershipPrice = 0;
    }
    
    membershipDisplay.innerHTML = `
        <div class="membership-item">
            <div class="membership-info">
                <span class="membership-badge">Membership</span>
                <span class="membership-details">Unlimited access to all videos for <strong>$${membershipPrice.toFixed(2)}</strong> per month</span>
            </div>
            <div class="membership-actions">
                <button class="edit-membership-btn" onclick="editMembership()">Edit</button>
                <button class="delete-membership-btn" onclick="deleteMembership('${subscriptionId}')">Remove</button>
            </div>
        </div>
    `;
}

// Edit membership
async function editMembership() {
    try {
        const currentPrice = await getMembershipPrice();
        if (currentPrice === null) return;
        
        const newPrice = prompt(`Enter new monthly membership price:`, currentPrice);
        if (newPrice === null) return;
        
        const priceValue = parseFloat(newPrice);
        
        if (isNaN(priceValue) || priceValue <= 0) {
            showError('Membership price must be greater than 0.');
            return;
        }
        
        await saveMembershipPrice(priceValue);
        await renderMembershipDisplay();
        document.getElementById('membershipPrice').value = priceValue.toFixed(2);
        showSuccess('Membership price updated successfully!');
        setTimeout(hideMessages, 3000);
    } catch (error) {
        console.error('Error updating membership:', error);
        showError('Failed to update membership: ' + error.message);
    }
}

// Delete membership
async function deleteMembership(subscriptionId) {
    if (!subscriptionId) {
        showError('No subscription found to delete');
        return;
    }
    
    if (confirm('Are you sure you want to remove the membership pricing?')) {
        try {
            await API.subscriptions.updateSubscription(subscriptionId, { isActive: false });
            await renderMembershipDisplay();
            showSuccess('Membership pricing removed successfully!');
            setTimeout(hideMessages, 3000);
        } catch (error) {
            console.error('Error deleting membership:', error);
            showError('Failed to remove membership: ' + error.message);
        }
    }
}

// Make deleteMembership and editMembership available globally
window.deleteMembership = deleteMembership;
window.editMembership = editMembership;

// Initialize pricing settings
async function initializePricingSettings() {
    // Render existing bundles and membership
    await renderBundlesList();
    await renderMembershipDisplay();
    
    // Load existing membership price into form if exists
    const membershipPrice = await getMembershipPrice();
    if (membershipPrice !== null) {
        document.getElementById('membershipPrice').value = membershipPrice.toFixed(2);
    }
    
    // Handle bundle form submission
    const bundleForm = document.getElementById('bundleForm');
    bundleForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const count = parseInt(document.getElementById('bundleCount').value);
        const price = parseFloat(document.getElementById('bundlePrice').value);
        
        if (count < 2) {
            showError('Bundle must include at least 2 videos.');
            return;
        }
        
        if (price <= 0) {
            showError('Bundle price must be greater than 0.');
            return;
        }
        
        try {
            await API.bundles.createBundle({
                videoCount: count,
                price: price
            });
            
            await renderBundlesList();
            bundleForm.reset();
            showSuccess('Bundle added successfully!');
            setTimeout(hideMessages, 3000);
        } catch (error) {
            console.error('Error creating bundle:', error);
            showError('Failed to create bundle: ' + error.message);
        }
    });
    
    // Handle membership form submission
    const membershipForm = document.getElementById('membershipForm');
    membershipForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const price = parseFloat(document.getElementById('membershipPrice').value);
        
        if (price <= 0) {
            showError('Membership price must be greater than 0.');
            return;
        }
        
        try {
            await saveMembershipPrice(price);
            await renderMembershipDisplay();
            showSuccess('Membership price saved successfully!');
            setTimeout(hideMessages, 3000);
        } catch (error) {
            console.error('Error saving membership:', error);
            showError('Failed to save membership: ' + error.message);
        }
    });
}

