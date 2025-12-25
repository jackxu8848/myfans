# MyFans - YouTube Video Manager

A web application that allows users to add any accessible YouTube videos, automatically extracts thumbnails and titles, and manages your video collection.

## Features

- ✅ Add YouTube videos by URL (public or unlisted)
- ✅ Automatic thumbnail and title extraction
- ✅ Validates that videos are accessible (rejects private/restricted videos)
- ✅ Video list management with local storage
- ✅ Delete videos from your list
- ✅ Click on thumbnails or titles to open videos
- ✅ Modern, responsive UI

## Setup Instructions

### Running the Application

Simply open `myfans.html` in your web browser. No build process, server, or API keys are required! The application uses YouTube's oEmbed API which doesn't require authentication.

## How It Works

1. **URL Validation**: Validates that the input is a valid YouTube URL
2. **Video ID Extraction**: Extracts the video ID from various YouTube URL formats
3. **Metadata Fetching**: Uses YouTube's oEmbed API to get thumbnail and title
4. **Accessibility Validation**: If the video can be fetched via oEmbed, it's accessible and can be added
   - ✅ Public videos: Allowed
   - ✅ Unlisted videos: Allowed
   - ❌ Private videos: Rejected (not accessible via oEmbed)
5. **Storage**: Videos are stored in browser's localStorage

## URL Formats Supported

- `https://www.youtube.com/watch?v=VIDEO_ID`
- `https://youtu.be/VIDEO_ID`
- `https://www.youtube.com/embed/VIDEO_ID`

## Browser Compatibility

Works in all modern browsers that support:
- ES6+ JavaScript
- Fetch API
- LocalStorage API

## Notes

- Videos are stored locally in your browser (localStorage)
- If you clear browser data, your video list will be lost
- For production use, consider implementing a backend database
- Click on video thumbnails or titles to open them in a new tab
- The application works entirely client-side - no API keys or backend required

