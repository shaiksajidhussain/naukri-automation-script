# 🚀 Naukri Auto Refresh

A modern web application that automates your Naukri profile updates with smart cookie management and a beautiful user interface.

## ✨ Features

- **🔐 Secure Cookie Management**: Store your Naukri login credentials securely and locally
- **🤖 Smart Automation**: Automatically detects and updates resume headlines
- **📱 Modern Web UI**: Beautiful, responsive interface for easy management
- **📊 Real-time Monitoring**: Live status updates and detailed activity logs
- **⚡ Background Processing**: Run automation in the background
- **🎯 Custom Headlines**: Option to set custom resume headlines or auto-append periods

## 🛠️ Installation

1. **Clone or download** this repository
2. **Install dependencies**:
   ```bash
   npm install
   ```

## 🚀 Quick Start

### Option 1: Web UI (Recommended)

1. **Start the web server**:
   ```bash
   npm start
   ```

2. **Open your browser** and navigate to `http://localhost:3000`

3. **Use the web interface** to:
   - Capture cookies (first time setup)
   - Start auto-refresh processes
   - Monitor progress in real-time

### Option 2: Command Line

1. **Capture cookies** (first time only):
   ```bash
   npm run capture-cookies
   ```

2. **Run auto-refresh**:
   ```bash
   npm run auto-refresh
   ```

## 📋 How It Works

### 1. Cookie Capture
- Opens Naukri login page
- You manually log in with Google
- Script captures and stores your session cookies
- Cookies are saved locally in `naukri.cookies.json`

### 2. Auto Refresh
- Uses stored cookies to access your profile
- Automatically locates the resume headline field
- Updates the headline (appends '.' if needed)
- Saves changes automatically

## 🌐 Web Interface Guide

### Cookie Capture Section
- **Headless Mode**: Choose between visible or hidden browser
- **Capture Cookies**: Click to start the cookie capture process
- **Status**: Shows success/failure messages

### Auto Refresh Section
- **Force Headline**: Enter custom headline or leave empty for auto-append
- **Background Mode**: Run automation in background
- **Start Auto Refresh**: Begin the automation process
- **Real-time Status**: Monitor progress and results

### Activity Logs
- **Live Updates**: See all activities in real-time
- **Timestamps**: Track when each action occurred
- **Clear Logs**: Remove old log entries

## ⚙️ Configuration

### Environment Variables
Create a `.env` file in the root directory:

```env
# Browser visibility (true/false)
HEADLESS=false

# Custom headline (optional)
FORCE_HEADLINE="Your Custom Headline"

# Server port
PORT=3000
```

### Headless Mode
- **`false`**: Browser is visible (good for debugging)
- **`true`**: Browser runs in background (good for automation)

## 🔧 API Endpoints

The web server provides these REST API endpoints:

- `GET /api/cookies/status` - Check cookie status
- `POST /api/cookies/capture` - Capture new cookies
- `POST /api/refresh/start` - Start auto-refresh
- `GET /api/refresh/status/:id` - Check process status
- `POST /api/refresh/stop/:id` - Stop running process
- `GET /api/refresh/processes` - List all processes

## 🎯 Use Cases

### For Job Seekers
- Keep your profile active and updated
- Automatically refresh resume headlines
- Maintain visibility in search results

### For Recruiters
- Automated profile management
- Consistent profile updates
- Time-saving automation

## 🚨 Important Notes

1. **First Time Setup**: Always use visible browser mode for initial cookie capture
2. **Cookie Expiry**: Cookies expire after 24 hours - recapture when needed
3. **Rate Limiting**: Don't run automation too frequently to avoid detection
4. **Privacy**: All data is stored locally on your machine

## 🐛 Troubleshooting

### Common Issues

1. **"No cookies found"**
   - Run cookie capture first
   - Check if `naukri.cookies.json` exists

2. **"Process failed"**
   - Check browser console for errors
   - Verify internet connection
   - Try visible browser mode

3. **"Element not found"**
   - Naukri website structure may have changed
   - Update selectors in scripts if needed

### Debug Mode
Enable debug mode by setting `HEADLESS=false` to see what's happening in the browser.

## 🔒 Security

- **Local Storage**: All cookies and data stored locally
- **No External Sharing**: Your credentials never leave your machine
- **Secure Sessions**: Uses official Naukri authentication

## 📱 Browser Compatibility

- Chrome/Chromium (recommended)
- Firefox
- Safari
- Edge

## 🤝 Contributing

Feel free to submit issues, feature requests, or pull requests to improve this tool.

## 📄 License

ISC License - feel free to use and modify as needed.

## 🆘 Support

If you encounter issues:
1. Check the activity logs in the web UI
2. Verify your internet connection
3. Ensure Naukri website is accessible
4. Check if cookies are still valid

---

**Happy automating! 🎉**
