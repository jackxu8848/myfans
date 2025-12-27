// Authentication Check
function checkAuth() {
    const currentUser = localStorage.getItem('myfans_current_user');
    if (!currentUser) {
        window.location.href = 'login.html';
        return null;
    }
    return JSON.parse(currentUser);
}

// Get stored videos from localStorage
function getStoredVideos() {
    const stored = localStorage.getItem('myfans_videos');
    return stored ? JSON.parse(stored) : [];
}

// Get stored bundles from localStorage
function getStoredBundles() {
    const stored = localStorage.getItem('myfans_bundles');
    return stored ? JSON.parse(stored) : [];
}

// Get membership price from localStorage
function getMembershipPrice() {
    const stored = localStorage.getItem('myfans_membership_price');
    return stored ? parseFloat(stored) : null;
}

// Get user's purchased videos
function getUserPurchasedVideos() {
    const stored = localStorage.getItem(`myfans_user_${getCurrentUserId()}_purchased`);
    return stored ? JSON.parse(stored) : [];
}

// Get user's membership status
function getUserMembershipStatus() {
    const stored = localStorage.getItem(`myfans_user_${getCurrentUserId()}_membership`);
    if (!stored) return null;
    const membership = JSON.parse(stored);
    // Check if membership is still valid (not expired)
    if (new Date(membership.expiresAt) > new Date()) {
        return membership;
    }
    return null;
}

// Get current user ID
function getCurrentUserId() {
    const user = checkAuth();
    return user ? user.id : null;
}

// Current selected videos for bundle
let selectedBundleVideos = [];
let currentBundleConfig = null;
let currentVideoForPayment = null;

// Render videos list
function renderVideosList() {
    const videosList = document.getElementById('videosList');
    const videos = getStoredVideos();
    const membership = getUserMembershipStatus();
    const purchasedVideos = getUserPurchasedVideos();
    
    if (videos.length === 0) {
        videosList.innerHTML = '<p class="empty-message">No videos available. Check back soon!</p>';
        return;
    }
    
    videosList.innerHTML = videos.map(video => {
        const videoUrl = video.url || `https://www.youtube.com/watch?v=${video.id}`;
        const price = video.price !== undefined ? video.price : 0;
        const priceDisplay = price === 0 ? 'FREE' : `$${price.toFixed(2)}`;
        const priceClass = price === 0 ? 'price-free' : 'price-paid';
        
        // Check if user has access
        const hasAccess = price === 0 || membership !== null || purchasedVideos.includes(video.id);
        
        return `
        <div class="video-card ${!hasAccess ? 'locked' : ''}" 
             data-video-id="${video.id}" 
             data-video-price="${price}" 
             data-video-url="${videoUrl}"
             data-video-thumbnail="${video.thumbnail}"
             data-video-title="${video.title.replace(/"/g, '&quot;')}">
            <div class="video-card-link">
                <img src="${video.thumbnail}" alt="${video.title}" class="video-card-thumbnail">
                ${!hasAccess ? '<div class="locked-overlay"><span>🔒</span></div>' : ''}
            </div>
            <div class="video-card-info">
                <h3 class="video-card-title">${video.title}</h3>
                <div class="video-card-price ${priceClass}">${priceDisplay}</div>
            </div>
        </div>
    `;
    }).join('');
    
    // Add click handlers to video cards
    const videoCards = document.querySelectorAll('.video-card');
    videoCards.forEach(card => {
        card.addEventListener('click', function() {
            const price = parseFloat(this.getAttribute('data-video-price')) || 0;
            const videoUrl = this.getAttribute('data-video-url');
            const videoId = this.getAttribute('data-video-id');
            const videoThumbnail = this.getAttribute('data-video-thumbnail');
            const videoTitle = this.getAttribute('data-video-title');
            
            const membership = getUserMembershipStatus();
            const purchasedVideos = getUserPurchasedVideos();
            const hasAccess = price === 0 || membership !== null || purchasedVideos.includes(videoId);
            
            if (hasAccess) {
                // User has access, open video
                window.open(videoUrl, '_blank', 'noopener,noreferrer');
            } else {
                // Show pricing options modal
                showPricingOptionsModal(videoId, videoUrl, videoThumbnail, videoTitle, price);
            }
        });
    });
}

// Show pricing options modal
function showPricingOptionsModal(videoId, videoUrl, thumbnail, title, price) {
    currentVideoForPayment = { videoId, videoUrl, thumbnail, title, price };
    
    const modal = document.getElementById('pricingOptionsModal');
    const modalThumbnail = document.getElementById('pricingModalThumbnail');
    const modalTitle = document.getElementById('pricingModalTitle');
    const modalPrice = document.getElementById('pricingModalPrice');
    const individualPrice = document.getElementById('individualPrice');
    
    // Set video info
    modalThumbnail.src = thumbnail;
    modalThumbnail.alt = title;
    modalTitle.textContent = title;
    modalPrice.textContent = `$${price.toFixed(2)}`;
    individualPrice.textContent = `$${price.toFixed(2)}`;
    
    // Check for bundle option
    const bundles = getStoredBundles();
    const bundleOption = document.getElementById('bundleOption');
    if (bundles.length > 0) {
        const bundle = bundles[0]; // Use first bundle
        bundleOption.style.display = 'block';
        document.getElementById('bundlePriceDisplay').textContent = `$${bundle.price.toFixed(2)}`;
        document.getElementById('bundleDescription').textContent = `Select any ${bundle.count} videos for $${bundle.price.toFixed(2)}`;
    } else {
        bundleOption.style.display = 'none';
    }
    
    // Check for membership option
    const membershipPrice = getMembershipPrice();
    const membershipOption = document.getElementById('membershipOption');
    if (membershipPrice !== null) {
        membershipOption.style.display = 'block';
        document.getElementById('membershipPriceDisplay').textContent = `$${membershipPrice.toFixed(2)}/month`;
    } else {
        membershipOption.style.display = 'none';
    }
    
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

// Hide pricing options modal
function hidePricingOptionsModal() {
    document.getElementById('pricingOptionsModal').style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Show payment modal
function showPaymentModal(videoId, videoUrl, thumbnail, title, price) {
    currentVideoForPayment = { videoId, videoUrl, thumbnail, title, price };
    
    const modal = document.getElementById('paymentModal');
    const modalThumbnail = document.getElementById('modalThumbnail');
    const modalTitle = document.getElementById('modalTitle');
    const modalPrice = document.getElementById('modalPrice');
    const bundleOption = document.getElementById('bundleOption');
    
    modalThumbnail.src = thumbnail;
    modalThumbnail.alt = title;
    modalTitle.textContent = title;
    modalPrice.textContent = `$${price.toFixed(2)}`;
    
    // Check if bundles are available
    const bundles = getStoredBundles();
    if (bundles.length > 0) {
        bundleOption.style.display = 'block';
    } else {
        bundleOption.style.display = 'none';
    }
    
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

// Show bundle modal
function showBundleModal(videoId, videoUrl) {
    const bundles = getStoredBundles();
    if (bundles.length === 0) return;
    
    // Use first bundle for now (in production, you might want to let user choose)
    const bundle = bundles[0];
    currentBundleConfig = bundle;
    selectedBundleVideos = [videoId]; // Pre-select the current video
    
    const bundleModal = document.getElementById('bundleModal');
    const bundleCountRequired = document.getElementById('bundleCountRequired');
    const bundlePriceDisplay = document.getElementById('bundlePriceDisplay');
    const requiredCount = document.getElementById('requiredCount');
    
    bundleCountRequired.textContent = bundle.count;
    bundlePriceDisplay.textContent = `$${bundle.price.toFixed(2)}`;
    requiredCount.textContent = bundle.count;
    
    renderBundleVideosList();
    updateBundleSummary();
    
    bundleModal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

// Render bundle videos list
function renderBundleVideosList() {
    const bundleVideosList = document.getElementById('bundleVideosList');
    const videos = getStoredVideos();
    const membership = getUserMembershipStatus();
    const purchasedVideos = getUserPurchasedVideos();
    
    bundleVideosList.innerHTML = videos.map(video => {
        const isSelected = selectedBundleVideos.includes(video.id);
        const hasAccess = video.price === 0 || membership !== null || purchasedVideos.includes(video.id);
        const isDisabled = hasAccess; // Don't allow selecting videos they already have access to
        
        return `
        <div class="bundle-video-item ${isSelected ? 'selected' : ''} ${isDisabled ? 'disabled' : ''}" 
             data-video-id="${video.id}"
             ${isDisabled ? 'title="You already have access to this video"' : ''}>
            <img src="${video.thumbnail}" alt="${video.title}">
            <div class="bundle-video-title">${video.title}</div>
        </div>
    `;
    }).join('');
    
    // Add click handlers
    const bundleItems = document.querySelectorAll('.bundle-video-item:not(.disabled)');
    bundleItems.forEach(item => {
        item.addEventListener('click', function() {
            const videoId = this.getAttribute('data-video-id');
            if (selectedBundleVideos.includes(videoId)) {
                selectedBundleVideos = selectedBundleVideos.filter(id => id !== videoId);
            } else {
                if (selectedBundleVideos.length < currentBundleConfig.count) {
                    selectedBundleVideos.push(videoId);
                } else {
                    alert(`You can only select ${currentBundleConfig.count} videos for this bundle.`);
                    return;
                }
            }
            renderBundleVideosList();
            updateBundleSummary();
        });
    });
}

// Update bundle summary
function updateBundleSummary() {
    const selectedCount = document.getElementById('selectedCount');
    const purchaseBundleBtn = document.getElementById('purchaseBundle');
    
    selectedCount.textContent = selectedBundleVideos.length;
    
    if (selectedBundleVideos.length === currentBundleConfig.count) {
        purchaseBundleBtn.disabled = false;
    } else {
        purchaseBundleBtn.disabled = true;
    }
}

// Show membership modal
function showMembershipModal(videoId, videoUrl, thumbnail, title, price) {
    const membershipPrice = getMembershipPrice();
    if (membershipPrice === null) {
        // No membership, show regular payment
        showPaymentModal(videoId, videoUrl, thumbnail, title, price);
        return;
    }
    
    currentVideoForPayment = { videoId, videoUrl, thumbnail, title, price };
    
    const membershipModal = document.getElementById('membershipModal');
    const membershipPriceDisplay = document.getElementById('membershipPriceDisplay');
    
    membershipPriceDisplay.textContent = `$${membershipPrice.toFixed(2)}`;
    
    membershipModal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

// Hide modals
function hidePaymentModal() {
    document.getElementById('paymentModal').style.display = 'none';
    document.body.style.overflow = 'auto';
}

function hideBundleModal() {
    document.getElementById('bundleModal').style.display = 'none';
    selectedBundleVideos = [];
    currentBundleConfig = null;
    document.body.style.overflow = 'auto';
}

function hideMembershipModal() {
    document.getElementById('membershipModal').style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Complete payment (simulated)
function completePayment(videoId, videoUrl) {
    const purchasedVideos = getUserPurchasedVideos();
    if (!purchasedVideos.includes(videoId)) {
        purchasedVideos.push(videoId);
        localStorage.setItem(`myfans_user_${getCurrentUserId()}_purchased`, JSON.stringify(purchasedVideos));
    }
    
    alert('Payment successful! Opening video...');
    hidePaymentModal();
    window.open(videoUrl, '_blank', 'noopener,noreferrer');
    renderVideosList();
}

// Complete bundle purchase
function completeBundlePurchase() {
    const purchasedVideos = getUserPurchasedVideos();
    selectedBundleVideos.forEach(videoId => {
        if (!purchasedVideos.includes(videoId)) {
            purchasedVideos.push(videoId);
        }
    });
    localStorage.setItem(`myfans_user_${getCurrentUserId()}_purchased`, JSON.stringify(purchasedVideos));
    
    alert(`Bundle purchase successful! You now have access to ${selectedBundleVideos.length} videos.`);
    hideBundleModal();
    renderVideosList();
}

// Complete membership purchase
function completeMembershipPurchase() {
    const membershipPrice = getMembershipPrice();
    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + 1); // 1 month from now
    
    const membership = {
        price: membershipPrice,
        purchasedAt: new Date().toISOString(),
        expiresAt: expiresAt.toISOString()
    };
    
    localStorage.setItem(`myfans_user_${getCurrentUserId()}_membership`, JSON.stringify(membership));
    
    alert('Membership activated! You now have unlimited access to all videos.');
    hideMembershipModal();
    if (currentVideoForPayment) {
        window.open(currentVideoForPayment.videoUrl, '_blank', 'noopener,noreferrer');
        currentVideoForPayment = null;
    }
    renderVideosList();
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
    if (modeToggle.checked) {
        // Creator mode
        window.location.href = encodeURI('myfans admin.html');
    } else {
        // Viewer mode (already on myfans.html)
    }
}

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
    const user = checkAuth();
    if (!user) return;
    
    // Set up profile
    setupProfile(user);
    
    // Render videos
    renderVideosList();
    
    // Mode toggle
    const modeToggle = document.getElementById('modeToggle');
    modeToggle.checked = false; // Default to viewer mode
    modeToggle.addEventListener('change', handleModeToggle);
    
    // Profile dropdown
    const profileAvatar = document.getElementById('profileAvatar');
    const profileMenu = document.getElementById('profileMenu');
    
    profileAvatar.addEventListener('click', function(e) {
        e.stopPropagation();
        profileMenu.style.display = profileMenu.style.display === 'none' ? 'block' : 'none';
    });
    
    // Close profile menu when clicking outside
    document.addEventListener('click', function(e) {
        if (!profileAvatar.contains(e.target) && !profileMenu.contains(e.target)) {
            profileMenu.style.display = 'none';
        }
    });
    
    // Profile logout
    document.getElementById('profileLogout').addEventListener('click', logout);
    
    // Pricing options modal handlers
    const closePricingOptions = document.getElementById('closePricingOptions');
    const cancelPricingOptions = document.getElementById('cancelPricingOptions');
    const pricingOptionsModal = document.getElementById('pricingOptionsModal');
    const selectIndividual = document.getElementById('selectIndividual');
    const selectBundle = document.getElementById('selectBundle');
    const selectMembership = document.getElementById('selectMembership');
    
    closePricingOptions.addEventListener('click', hidePricingOptionsModal);
    cancelPricingOptions.addEventListener('click', hidePricingOptionsModal);
    
    pricingOptionsModal.addEventListener('click', function(e) {
        if (e.target === pricingOptionsModal) {
            hidePricingOptionsModal();
        }
    });
    
    selectIndividual.addEventListener('click', function() {
        hidePricingOptionsModal();
        if (currentVideoForPayment) {
            showPaymentModal(currentVideoForPayment.videoId, currentVideoForPayment.videoUrl, 
                           currentVideoForPayment.thumbnail, currentVideoForPayment.title, 
                           currentVideoForPayment.price);
        }
    });
    
    selectBundle.addEventListener('click', function() {
        hidePricingOptionsModal();
        if (currentVideoForPayment) {
            showBundleModal(currentVideoForPayment.videoId, currentVideoForPayment.videoUrl);
        }
    });
    
    selectMembership.addEventListener('click', function() {
        hidePricingOptionsModal();
        if (currentVideoForPayment) {
            showMembershipModal(currentVideoForPayment.videoId, currentVideoForPayment.videoUrl,
                              currentVideoForPayment.thumbnail, currentVideoForPayment.title,
                              currentVideoForPayment.price);
        }
    });
    
    // Payment modal handlers
    const closeModal = document.getElementById('closeModal');
    const cancelPayment = document.getElementById('cancelPayment');
    const proceedPayment = document.getElementById('proceedPayment');
    const paymentModal = document.getElementById('paymentModal');
    
    closeModal.addEventListener('click', hidePaymentModal);
    cancelPayment.addEventListener('click', hidePaymentModal);
    
    paymentModal.addEventListener('click', function(e) {
        if (e.target === paymentModal) {
            hidePaymentModal();
        }
    });
    
    proceedPayment.addEventListener('click', function() {
        if (currentVideoForPayment) {
            completePayment(currentVideoForPayment.videoId, currentVideoForPayment.videoUrl);
        }
    });
    
    // Bundle modal handlers
    const closeBundleModal = document.getElementById('closeBundleModal');
    const cancelBundle = document.getElementById('cancelBundle');
    const purchaseBundle = document.getElementById('purchaseBundle');
    const bundleModal = document.getElementById('bundleModal');
    
    closeBundleModal.addEventListener('click', hideBundleModal);
    cancelBundle.addEventListener('click', hideBundleModal);
    
    bundleModal.addEventListener('click', function(e) {
        if (e.target === bundleModal) {
            hideBundleModal();
        }
    });
    
    purchaseBundle.addEventListener('click', completeBundlePurchase);
    
    // Membership modal handlers
    const closeMembershipModal = document.getElementById('closeMembershipModal');
    const cancelMembership = document.getElementById('cancelMembership');
    const proceedMembershipPayment = document.getElementById('proceedMembershipPayment');
    const membershipModal = document.getElementById('membershipModal');
    
    closeMembershipModal.addEventListener('click', hideMembershipModal);
    cancelMembership.addEventListener('click', hideMembershipModal);
    
    membershipModal.addEventListener('click', function(e) {
        if (e.target === membershipModal) {
            hideMembershipModal();
        }
    });
    
    proceedMembershipPayment.addEventListener('click', completeMembershipPurchase);
    
    // Close modals with Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            hidePricingOptionsModal();
            hidePaymentModal();
            hideBundleModal();
            hideMembershipModal();
        }
    });
});

// Setup profile display
function setupProfile(user) {
    const profileInitials = document.getElementById('profileInitials');
    const profileName = document.getElementById('profileName');
    const profileEmail = document.getElementById('profileEmail');
    
    // Get initials from name
    const nameParts = user.name.split(' ');
    const initials = nameParts.length > 1 
        ? (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase()
        : user.name.substring(0, 2).toUpperCase();
    
    profileInitials.textContent = initials;
    profileName.textContent = user.name;
    profileEmail.textContent = user.email;
}
