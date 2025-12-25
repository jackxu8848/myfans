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
            if (response.status === 401 || response.status === 403) {
                throw new Error('Video is private or restricted');
            }
            if (response.status === 404) {
                throw new Error('Video not found');
            }
            // For other errors, provide a generic message with status
            throw new Error(`Failed to fetch video information (${response.status} ${response.statusText})`);
        }
        
        const data = await response.json();
        return {
            title: data.title,
            thumbnail: data.thumbnail_url,
            author: data.author_name,
            success: true
        };
    } catch (error) {
        // Re-throw network errors or API errors
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

// Add video to list
function addVideoToList(videoId, videoInfo, videoUrl, price) {
    const videosList = document.getElementById('videosList');
    const emptyMessage = videosList.querySelector('.empty-message');
    
    if (emptyMessage) {
        emptyMessage.remove();
    }
    
    // Get existing videos from localStorage
    const videos = getStoredVideos();
    
    // Check if video already exists
    if (videos.some(v => v.id === videoId)) {
        showError('This video has already been added.');
        return;
    }
    
    // Add new video
    const priceValue = parseFloat(price) || 0;
    const newVideo = {
        id: videoId,
        title: videoInfo.title,
        thumbnail: videoInfo.thumbnail,
        url: videoUrl,
        price: priceValue,
        addedAt: new Date().toISOString()
    };
    
    videos.push(newVideo);
    saveVideosToStorage(videos);
    renderVideosList();
    
    showSuccess('Video added successfully!');
}

// Get stored videos from localStorage
function getStoredVideos() {
    const stored = localStorage.getItem('myfans_videos');
    return stored ? JSON.parse(stored) : [];
}

// Save videos to localStorage
function saveVideosToStorage(videos) {
    localStorage.setItem('myfans_videos', JSON.stringify(videos));
}

// Render videos list
function renderVideosList() {
    const videosList = document.getElementById('videosList');
    const videos = getStoredVideos();
    
    if (videos.length === 0) {
        videosList.innerHTML = '<p class="empty-message">No videos added yet. Add your first video above!</p>';
        return;
    }
    
    videosList.innerHTML = videos.map(video => {
        const videoUrl = video.url || `https://www.youtube.com/watch?v=${video.id}`;
        const price = video.price !== undefined ? video.price : 0;
        const priceDisplay = price === 0 ? 'FREE' : `$${price.toFixed(2)}`;
        const priceClass = price === 0 ? 'price-free' : 'price-paid';
        return `
        <div class="video-card" data-video-id="${video.id}">
            <a href="${videoUrl}" target="_blank" rel="noopener noreferrer" class="video-card-link">
                <img src="${video.thumbnail}" alt="${video.title}" class="video-card-thumbnail">
            </a>
            <div class="video-card-info">
                <a href="${videoUrl}" target="_blank" rel="noopener noreferrer" class="video-card-title-link">
                    <h3 class="video-card-title">${video.title}</h3>
                </a>
                <div class="video-card-price ${priceClass}">${priceDisplay}</div>
                <div class="video-card-meta">
                    <span class="video-card-id">${video.id}</span>
                    <div class="video-card-actions">
                        <button class="edit-btn" onclick="editVideoPrice('${video.id}')">Edit Price</button>
                        <button class="delete-btn" onclick="deleteVideo('${video.id}')">Delete</button>
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
function deleteVideo(videoId) {
    if (confirm('Are you sure you want to delete this video?')) {
        const videos = getStoredVideos();
        const filteredVideos = videos.filter(v => v.id !== videoId);
        saveVideosToStorage(filteredVideos);
        renderVideosList();
        showSuccess('Video deleted successfully!');
        setTimeout(hideMessages, 3000);
    }
}

// Authentication Check
function checkAuth() {
    const currentUser = localStorage.getItem('myfans_current_user');
    if (!currentUser) {
        window.location.href = 'login.html';
        return null;
    }
    return JSON.parse(currentUser);
}

// Logout
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('myfans_current_user');
        window.location.href = 'login.html';
    }
}

// Mode toggle
function handleModeToggle() {
    const modeToggle = document.getElementById('modeToggle');
    if (!modeToggle.checked) {
        // Viewer mode
        window.location.href = 'myfans.html';
    }
    // Creator mode (already on admin page)
}

// Edit video price
function editVideoPrice(videoId) {
    const videos = getStoredVideos();
    const video = videos.find(v => v.id === videoId);
    
    if (!video) return;
    
    const newPrice = prompt(`Enter new price for "${video.title}"`, video.price || 0);
    
    if (newPrice !== null) {
        const priceValue = parseFloat(newPrice);
        if (!isNaN(priceValue) && priceValue >= 0) {
            video.price = priceValue;
            saveVideosToStorage(videos);
            renderVideosList();
            showSuccess('Video price updated successfully!');
            setTimeout(hideMessages, 3000);
        } else {
            showError('Please enter a valid price (0 or greater).');
        }
    }
}

// Make functions available globally
window.deleteVideo = deleteVideo;
window.editVideoPrice = editVideoPrice;

// Handle form submission
document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
    const user = checkAuth();
    if (!user) return;
    
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
    renderVideosList();
    
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
            
            // If we got here, the video is accessible
            // Display preview
            displayVideoPreview(videoInfo, videoId, url, priceValue);
            
            // Add to list
            addVideoToList(videoId, videoInfo, url, priceValue);
            
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

// Get stored bundles from localStorage
function getStoredBundles() {
    const stored = localStorage.getItem('myfans_bundles');
    return stored ? JSON.parse(stored) : [];
}

// Save bundles to localStorage
function saveBundlesToStorage(bundles) {
    localStorage.setItem('myfans_bundles', JSON.stringify(bundles));
}

// Get stored membership price from localStorage
function getMembershipPrice() {
    const stored = localStorage.getItem('myfans_membership_price');
    return stored ? parseFloat(stored) : null;
}

// Save membership price to localStorage
function saveMembershipPrice(price) {
    localStorage.setItem('myfans_membership_price', price.toString());
}

// Render bundles list
function renderBundlesList() {
    const bundlesList = document.getElementById('bundlesList');
    const bundles = getStoredBundles();
    
    if (bundles.length === 0) {
        bundlesList.innerHTML = '<p class="empty-bundles">No bundles configured yet.</p>';
        return;
    }
    
    bundlesList.innerHTML = bundles.map((bundle, index) => `
        <div class="bundle-item">
            <div class="bundle-info">
                <span class="bundle-badge">Bundle</span>
                <span class="bundle-details">Select any <strong>${bundle.count}</strong> videos for <strong>$${bundle.price.toFixed(2)}</strong></span>
            </div>
            <div class="bundle-actions">
                <button class="edit-bundle-btn" onclick="editBundle(${index})">Edit</button>
                <button class="delete-bundle-btn" onclick="deleteBundle(${index})">Delete</button>
            </div>
        </div>
    `).join('');
}

// Edit bundle
function editBundle(index) {
    const bundles = getStoredBundles();
    const bundle = bundles[index];
    
    const newCount = prompt(`Enter number of videos for bundle:`, bundle.count);
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
    
    bundle.count = countValue;
    bundle.price = priceValue;
    saveBundlesToStorage(bundles);
    renderBundlesList();
    showSuccess('Bundle updated successfully!');
    setTimeout(hideMessages, 3000);
}

// Delete bundle
function deleteBundle(index) {
    if (confirm('Are you sure you want to delete this bundle?')) {
        const bundles = getStoredBundles();
        bundles.splice(index, 1);
        saveBundlesToStorage(bundles);
        renderBundlesList();
        showSuccess('Bundle deleted successfully!');
        setTimeout(hideMessages, 3000);
    }
}

// Make deleteBundle and editBundle available globally
window.deleteBundle = deleteBundle;
window.editBundle = editBundle;

// Render membership display
function renderMembershipDisplay() {
    const membershipDisplay = document.getElementById('membershipDisplay');
    const price = getMembershipPrice();
    
    if (price === null) {
        membershipDisplay.innerHTML = '<p class="empty-membership">No membership price set yet.</p>';
        return;
    }
    
    membershipDisplay.innerHTML = `
        <div class="membership-item">
            <div class="membership-info">
                <span class="membership-badge">Membership</span>
                <span class="membership-details">Unlimited access to all videos for <strong>$${price.toFixed(2)}</strong> per month</span>
            </div>
            <div class="membership-actions">
                <button class="edit-membership-btn" onclick="editMembership()">Edit</button>
                <button class="delete-membership-btn" onclick="deleteMembership()">Remove</button>
            </div>
        </div>
    `;
}

// Edit membership
function editMembership() {
    const currentPrice = getMembershipPrice();
    if (currentPrice === null) return;
    
    const newPrice = prompt(`Enter new monthly membership price:`, currentPrice);
    if (newPrice === null) return;
    
    const priceValue = parseFloat(newPrice);
    
    if (isNaN(priceValue) || priceValue <= 0) {
        showError('Membership price must be greater than 0.');
        return;
    }
    
    saveMembershipPrice(priceValue);
    renderMembershipDisplay();
    document.getElementById('membershipPrice').value = priceValue.toFixed(2);
    showSuccess('Membership price updated successfully!');
    setTimeout(hideMessages, 3000);
}

// Delete membership
function deleteMembership() {
    if (confirm('Are you sure you want to remove the membership pricing?')) {
        localStorage.removeItem('myfans_membership_price');
        renderMembershipDisplay();
        showSuccess('Membership pricing removed successfully!');
        setTimeout(hideMessages, 3000);
    }
}

// Make deleteMembership and editMembership available globally
window.deleteMembership = deleteMembership;
window.editMembership = editMembership;

// Initialize pricing settings
function initializePricingSettings() {
    // Render existing bundles and membership
    renderBundlesList();
    renderMembershipDisplay();
    
    // Load existing membership price into form if exists
    const membershipPrice = getMembershipPrice();
    if (membershipPrice !== null) {
        document.getElementById('membershipPrice').value = membershipPrice.toFixed(2);
    }
    
    // Handle bundle form submission
    const bundleForm = document.getElementById('bundleForm');
    bundleForm.addEventListener('submit', function(e) {
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
        
        const bundles = getStoredBundles();
        bundles.push({ count, price });
        saveBundlesToStorage(bundles);
        renderBundlesList();
        
        // Reset form
        bundleForm.reset();
        
        showSuccess('Bundle added successfully!');
        setTimeout(hideMessages, 3000);
    });
    
    // Handle membership form submission
    const membershipForm = document.getElementById('membershipForm');
    membershipForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const price = parseFloat(document.getElementById('membershipPrice').value);
        
        if (price <= 0) {
            showError('Membership price must be greater than 0.');
            return;
        }
        
        saveMembershipPrice(price);
        renderMembershipDisplay();
        
        showSuccess('Membership price saved successfully!');
        setTimeout(hideMessages, 3000);
    });
}

