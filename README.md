# CryptoFolio Pro - Professional Crypto Portfolio Tracker

A beautiful, professional cryptocurrency portfolio tracking application with a Catppuccin Mocha theme and comprehensive features.

## 🎨 Features

- **2-Tab Interface**: Dashboard and Positions
- **Real-time Price Updates**: Fetches live data from CoinGecko API
- **Import/Export**: Import from backup files or export your portfolio in JSON format
- **Sortable Dashboard**: Sort holdings by Asset, Holdings, Price, Value, and P&L
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Local Storage**: Your data is saved locally and persists between sessions
- **CORS Support**: Proxy server included for local development

## 🚀 Quick Start

### Method 1: Local Server (Recommended)
1. **Install Dependencies**:
   ```bash
   bun install
   ```

2. **Start the server**:
   ```bash
   bun run server.js
   ```

3. **Open `http://localhost:8080`** in your browser

### Method 2: Direct Browser
1. **Open `index.html`** in your web browser
2. Note: Some API features may be limited due to browser CORS policies without the proxy server.

## 📂 Project Structure

```
crypto-portfolio-pro/
├── index.html          # Main application HTML
├── styles.css          # Styling (Catppuccin Refined theme)
├── app.js              # Main application logic
├── server.js           # Bun server with CoinGecko API proxy
├── package.json        # Dependencies
└── README.md           # Documentation
```

## 📖 Usage

### Adding Positions
1. Click **Add Transaction** button.
2. Search for any cryptocurrency (e.g., "Keeta", "Bitcoin").
3. Enter amount, buy price, and date.
4. Save to see your portfolio update.

### Dashboard Sorting
- Click on any column header in the "Portfolio Holdings" table to sort by that metric.
- Click again to toggle between Ascending and Descending order.

### Import/Export
- **Import**: Click the upload icon (cloud with arrow up) to load a `portfolio.json` file.
- **Export**: Click the download icon (cloud with arrow down) to save a backup of your data.

## 🔧 Technical Details

- **Frontend**: HTML5, CSS3, Vanilla JavaScript (ES6+)
- **Backend**: Bun (for local serving and API proxying)
- **API**: CoinGecko API (via proxy)
- **Theme**: Catppuccin Refined (Dark Mode)
- **Data Persistence**: `localStorage`

## 🌟 Catppuccin Refined Theme

The UI uses a customized "Catppuccin Refined" palette for a modern, glassmorphism look:
- **Background**: `#181825` (Mantle)
- **Surface**: `#1e1e2e` (Base) with transparency
- **Accents**: `#cba6f7` (Mauve), `#fab387` (Yellow), `#a6e3a1` (Green), `#f38ba8` (Red)

## 🔐 Privacy

- **Local Only**: Your portfolio data never leaves your browser (stored in `localStorage`).
- **No Tracking**: No analytics or data collection.
- **Open Source**: Full transparency.

## 📞 Support

If you encounter API errors (red indicator), ensure the local server is running (`bun run server.js`) to handle CORS requests properly.
