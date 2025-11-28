# CryptoFolio Pro - Professional Crypto Portfolio Tracker

A beautiful, professional cryptocurrency portfolio tracking application with a Catppuccin Mocha theme and comprehensive features.

## 🎨 Features

- **4-Tab Interface**: Dashboard, Positions, Holdings, Analytics
- **Real-time Price Updates**: Fetches live data from CoinGecko API
- **Import/Export**: Import from backup files or export your portfolio
- **Advanced Charts**: Portfolio distribution, performance metrics, risk analysis
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Local Storage**: Your data is saved locally and persists between sessions
- **CORS Support**: Works with both direct API and CORS proxy

## 🚀 Quick Start

### Option 1: Using Local Files (Recommended for most users)
1. **Open `index.html`** in your web browser
2. This will work with online features when API is accessible
3. If API calls fail, the app will still function with cached/saved data

### Option 2: Using Local Server (For CORS issues)
1. **Install Node.js** if not already installed:
   ```bash
   npm install -g
   ```

2. **Start the server**:
   ```bash
   node server.js
   ```

3. **Open `http://localhost:8080`** in your browser
4. Import your portfolio with the import button

## 📂 Project Structure

```
crypto-portfolio-pro/
├── index.html          # Main application
├── styles.css          # Styling with Catppuccin theme
├── script.js          # Main application logic
├── api.js            # API module (loaded dynamically)
├── server.js          # Optional local server for CORS issues
├── package.json      # Node.js dependencies
└── README.md         # This file
```

## 🛠 Installation

### Method 1: Direct Browser (No Server Needed)
1. Open `index.html` directly in your web browser
2. The app includes built-in fallbacks for when the API is not accessible

### Method 2: Local Server (Resolves CORS Issues)
1. Install Node.js
2. Run the local server
3. Open `http://localhost:8080`

## 📖 Usage

### Adding Positions
1. Click **Add Position** button
2. Search for any cryptocurrency
3. Enter amount and buy price
4. View your portfolio grow with real-time data

### Importing from Backup
1. Click the **import button** (📤) in the header
2. Select your `portfolio-*.json` backup file
3. Your positions will be automatically imported

### Viewing Analytics
1. Switch to the **Analytics** tab
2. See:
   - Total return percentage
   - Win rate (profitable vs loss positions)
   - Portfolio distribution charts
   - Risk analysis metrics

### Exporting Your Data
1. Click the **export** button (📊) in the header
2. Choose between:
   - JSON format (for re-importing)
   - CSV format (for spreadsheet analysis)

## 🔧 Technical Details

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **API**: CoinGecko API with proxy support
- **Theme**: Catppuccin Mocha (Dark Mode)
- **Local Storage**: Browser localStorage for persistence
- **CORS Handling**: Automatic proxy usage for file:// protocol
- **Rate Limiting**: 1 second between requests to avoid API limits
- **Caching**: 1-minute cache to reduce API calls

## 🌟 Catppuccin Mocha Color Palette

- **Base**: `#1e1e2e`
- **Mantle**: `#181825`
- **Crust**: `#11111b`
- **Text**: `#cdd6f4`
- **Subtext**: `#a6adc8`
- **Surface0**: `#313244`
- **Surface1**: `#45475a`
- **Surface2**: `#585b70`
- **Mauve**: `#cba6f7`
- **Pink**: `#f2cdcd`
- **Green**: `#a6e3a1`
- **Red**: `#f38ba8a`
- **Yellow**: `#fab387`

## 📊 Your Portfolio Data

Your backup shows a diverse portfolio with multiple positions across 16 different cryptocurrencies, including:
- **Layer 1**: Bitcoin, Ethereum, Solana
- **Layer 2**: Cardano, Chainlink, Polygon
- **Meme Coins**: Shiba Inu, Pepe, PENGU
- **New Projects**: HBAR, ICP, DOVU, KAS
- **Privacy Coins**: Monero, Dash, Zcash

## 🔐 Privacy & Security

- **Local Only**: Your portfolio data never leaves your browser
- **No Tracking**: No analytics or data collection
- **Open Source**: Full transparency - view the code yourself
- **Secure**: No API keys or authentication required

## 🎯 Get Started

1. Open the application in your browser
2. Start adding your cryptocurrency positions
3. Track your portfolio's performance over time

## 📞 Support

If you encounter any issues:
1. Check browser console for error messages
2. Ensure you have Node.js installed for server option
3. Try the direct browser method first
4. Clear your browser cache if needed

Your crypto portfolio is now ready to use! 🎉