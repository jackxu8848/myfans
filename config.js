// MyFans Configuration
// This file sets up the API base URL based on the environment

(function() {
    // Check if API_BASE_URL is already set (useful for production overrides)
    if (window.API_BASE_URL) {
        return; // Already configured
    }
    
    const hostname = window.location.hostname;
    const protocol = window.location.protocol;
    const port = window.location.port;
    
    // Development: localhost
    if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '') {
        window.API_BASE_URL = 'http://localhost:3000/api';
    } else {
        // Production: Use the same domain as frontend, or set a custom URL
        // Option 1: Backend on same domain (e.g., /api route)
        window.API_BASE_URL = `${protocol}//${hostname}${port ? ':' + port : ''}/api`;
        
        // Option 2: Backend on different domain - uncomment and set your backend URL:
        // window.API_BASE_URL = 'https://your-backend-domain.com/api';
        
        // Option 3: Backend on subdomain - example:
        // window.API_BASE_URL = `https://api.${hostname}/api`;
    }
    
    console.log('API Base URL:', window.API_BASE_URL);
})();

