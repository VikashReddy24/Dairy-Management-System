# Troubleshooting Guide - Mobile Chrome Issues

## Issue: Buttons Not Working / Data Not Storing

### Solution 1: Use a Local Web Server (RECOMMENDED)

Mobile Chrome may block LocalStorage when opening files directly (file:// protocol). Use a local web server instead:

#### For Android:
1. Install "Simple HTTP Server" or "HTTP Server" from Play Store
2. Open the app and navigate to your `dairy-management` folder
3. Start the server
4. Open the provided URL (usually http://localhost:8080) in Chrome
5. Add to Home Screen for easy access

#### For iOS:
1. Install "Server for PHP" or similar from App Store
2. Point it to your `dairy-management` folder
3. Open the provided URL in Safari
4. Add to Home Screen

#### Using Computer as Server:
1. On your computer, open terminal/command prompt in the `dairy-management` folder
2. Run: `python -m http.server 8000` (Python 3) or `python -m SimpleHTTPServer 8000` (Python 2)
3. Find your computer's IP address (ipconfig on Windows, ifconfig on Mac/Linux)
4. On your phone, open Chrome and go to: `http://YOUR_IP:8000`
5. Example: `http://192.168.1.100:8000`

### Solution 2: Enable LocalStorage in Chrome

1. Open Chrome on mobile
2. Go to Settings → Site Settings → Storage
3. Make sure "Storage" is allowed
4. Clear cache and reload

### Solution 3: Use Different Browser

Try using:
- Firefox Mobile
- Samsung Internet Browser
- Edge Mobile

### Solution 4: Check Browser Console

1. Open Chrome on mobile
2. Connect phone to computer via USB
3. Enable USB debugging
4. Open Chrome DevTools on computer: `chrome://inspect`
5. Check for errors in Console tab

## Testing Storage

To verify storage is working:
1. Open the app
2. Check the header - it should show "✓ Storage Ready"
3. If it shows "⚠ Storage Not Available", storage is blocked
4. Try adding a customer - if it saves, storage works!

## Common Issues

### Buttons don't respond:
- Make sure you're using a web server (not file://)
- Check browser console for errors
- Try refreshing the page

### Data disappears:
- Check if storage is enabled in browser settings
- Make sure you're not in incognito/private mode
- Clear browser cache and try again

### App doesn't load:
- Check internet connection (needed for jsPDF library)
- Make sure all files are in correct folders:
  ```
  dairy-management/
    ├── index.html
    ├── css/
    │   └── style.css
    └── js/
        └── app.js
  ```

## Best Practice

**Always use a local web server** when testing on mobile. The file:// protocol has many restrictions that can break functionality.


