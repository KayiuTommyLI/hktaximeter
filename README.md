# Hong Kong Taxi Meter

A modern, web-based taxi meter application that simulates the official Hong Kong taxi fare calculation system. Built with React and Tailwind CSS, featuring GPS tracking for accurate distance measurement and a realistic digital display.

![HK Taxi Meter Screenshot](screenshot.png)

## Features

### 🚕 Accurate Fare Calculation
- **Urban Red Taxi Rates**: Based on July 2024 official Hong Kong taxi fares
- **Flag Fall**: HK$29 for first 2km
- **Tiered Pricing**: 
  - HK$2.1 per 200m increment (up to HK$102.5)
  - HK$1.4 per 200m increment (above HK$102.5)
- **Waiting Time**: HK$2.1/1.4 per minute based on total fare

### 📍 GPS Integration
- **Real-time Location Tracking**: Uses device GPS for accurate distance measurement
- **Haversine Formula**: Precise distance calculation between coordinates
- **Fallback System**: Automatic simulation if GPS unavailable
- **Status Indicators**: Visual feedback for GPS connectivity

### 💻 Modern Interface
- **Digital Display**: DSEG7 Classic font for authentic meter appearance
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Touch-Friendly**: Large buttons optimized for mobile use
- **Dark Theme**: Easy on the eyes for night driving

### 🎛️ Full Control Panel
- **Hire/Stop Toggle**: Start and stop fare calculation
- **Extras Addition**: Add HK$1 and HK$10 surcharges
- **Reset Functions**: Clear extras or reset entire meter
- **Status Display**: Shows HIRED/FOR HIRE status

## Technical Stack

- **Frontend**: React 18.2.0
- **Styling**: Tailwind CSS 3.3.3
- **Build Tool**: Vite 4.4.5
- **Font**: DSEG7 Classic (7-segment display font)
- **APIs**: Geolocation API for GPS tracking

## Installation

### Prerequisites
- Node.js 16+ and npm
- Modern web browser with GPS support
- HTTPS connection (required for GPS in production)

### Setup Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/hk-taxi-meter.git
   cd hk-taxi-meter
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Download DSEG Font**
   - Visit [DSEG Font Website](https://www.keshikan.net/fonts-e.html)
   - Download the DSEG font package
   - Extract `DSEG7Classic-Bold.woff` and `DSEG7Classic-Bold.woff2`
   - Place them in `public/fonts/` directory

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   - Navigate to `http://localhost:5173`
   - Allow location access when prompted

## Project Structure

```
hk-taxi-meter/
├── public/
│   └── fonts/
│       ├── DSEG7Classic-Bold.woff2
│       └── DSEG7Classic-Bold.woff
├── src/
│   ├── App.jsx              # Main application component
│   ├── index.css            # Global styles and font definitions
│   └── main.jsx             # React application entry point
├── index.html               # HTML template
├── package.json             # Project dependencies
├── postcss.config.js        # PostCSS configuration
├── tailwind.config.js       # Tailwind CSS configuration
├── vite.config.js           # Vite build configuration
├── LICENSE                  # MIT License
└── README.md               # This file
```

## Usage

### Basic Operation

1. **Start a Trip**
   - Click the red "空" (Vacant) button to start hiring
   - Status changes to "HIRED" with pulsing indicator
   - GPS tracking begins automatically
   - Flag fall charge (HK$29) appears immediately

2. **During Trip**
   - Fare updates automatically based on distance and time
   - GPS status indicator shows connection status
   - Distance traveled displays in real-time

3. **Add Extras**
   - Use "+$10" and "+$1" buttons for surcharges
   - Toll fees, luggage charges, etc.
   - Extras display in separate panel

4. **End Trip**
   - Click "停" (Stop) button to end hiring
   - GPS tracking stops
   - Final fare displayed

5. **Reset Functions**
   - "$" button: Reset extras only
   - "i" button: Reset entire meter

### GPS Features

- **Automatic Tracking**: Starts when meter is hired
- **High Accuracy**: Uses `enableHighAccuracy: true`
- **Error Handling**: Falls back to simulation if GPS fails
- **Battery Optimization**: Tracking stops when meter is not hired

## Configuration

### Fare Constants

Update fare rates in `src/App.jsx`:

```javascript
const FLAG_FALL_CHARGE = 29;              // HK$ flag fall
const FLAG_FALL_DISTANCE_KM = 2;          // km covered by flag fall
const INCREMENTAL_CHARGE_TIER1 = 2.1;     // HK$ per 200m (tier 1)
const INCREMENTAL_CHARGE_TIER2 = 1.4;     // HK$ per 200m (tier 2)
const TIER1_FARE_THRESHOLD = 102.5;       // HK$ threshold for tier 2
```

### GPS Settings

Modify GPS options in `startGPSTracking()`:

```javascript
{
    enableHighAccuracy: true,    // Use GPS instead of network
    timeout: 5000,              // Max time for position update
    maximumAge: 1000            // Accept cached position age
}
```

## Building for Production

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Preview production build**
   ```bash
   npm run preview
   ```

3. **Deploy to hosting service**
   - Upload `dist/` folder contents
   - Ensure HTTPS is enabled (required for GPS)
   - Configure proper MIME types for font files

### Deployment Notes

- **HTTPS Required**: Geolocation API requires secure connection
- **Font MIME Types**: Ensure `.woff` and `.woff2` files serve correctly
- **Browser Permissions**: Users must allow location access

## Browser Support

### Minimum Requirements
- **Chrome**: 50+
- **Firefox**: 55+
- **Safari**: 11+
- **Edge**: 79+

### GPS Support
- Desktop: Limited accuracy (network-based)
- Mobile: High accuracy (GPS-based)
- HTTPS: Required for geolocation in production

## API Reference

### Core Functions

#### `calculateMainFareLogic(distanceKm, waitingTimeMin)`
Calculates taxi fare based on distance and waiting time.

**Parameters:**
- `distanceKm` (number): Total distance traveled
- `waitingTimeMin` (number): Total waiting/slow-moving time

**Returns:** Calculated fare in HK$

#### `calculateDistance(lat1, lon1, lat2, lon2)`
Calculates distance between GPS coordinates using Haversine formula.

**Parameters:**
- `lat1, lon1` (number): Starting latitude and longitude
- `lat2, lon2` (number): Ending latitude and longitude

**Returns:** Distance in kilometers

### State Management

The application uses React hooks for state management:

- `mainFare`: Current taxi fare (excluding extras)
- `extrasFare`: Additional charges (tolls, luggage, etc.)
- `isHired`: Whether meter is currently running
- `liveDistanceKm`: Real-time distance from GPS
- `elapsedTimeSec`: Time since hire started
- `startPosition/currentPosition`: GPS coordinates
- `gpsError`: GPS error messages

## Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make your changes**
4. **Add tests if applicable**
5. **Commit with clear message**
   ```bash
   git commit -m "Add: feature description"
   ```
6. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```
7. **Create Pull Request**

### Development Guidelines

- Follow existing code style
- Test on multiple devices
- Verify GPS functionality works
- Update documentation for new features
- Ensure responsive design

## Troubleshooting

### Common Issues

#### GPS Not Working
```
Problem: "GPS Error: User denied geolocation"
Solution: Allow location access in browser settings
```

#### Font Not Loading
```
Problem: Numbers appear in regular font instead of 7-segment
Solution: Ensure DSEG font files are in public/fonts/ directory
```

#### Build Errors
```
Problem: "Failed to resolve import"
Solution: Run npm install to ensure all dependencies are installed
```

#### HTTPS Issues
```
Problem: GPS doesn't work on production
Solution: Deploy to HTTPS-enabled hosting service
```

### Performance Tips

- **GPS Accuracy**: Works best on mobile devices
- **Battery Usage**: GPS tracking uses more battery
- **Network**: Requires internet connection for initial GPS lock
- **Caching**: Font files are cached for better performance

## Roadmap

### Planned Features

- [ ] **Multiple Taxi Types**: Support for different taxi categories
- [ ] **Trip History**: Save and review past trips
- [ ] **Receipt Generation**: PDF receipt creation
- [ ] **Offline Mode**: Work without internet connection
- [ ] **Voice Announcements**: Audio fare updates
- [ ] **Multi-language**: Support for Traditional Chinese
- [ ] **Export Data**: CSV export for trip records

### Technical Improvements

- [ ] **PWA Support**: Progressive Web App features
- [ ] **Background GPS**: Continue tracking when app backgrounded
- [ ] **Better Error Handling**: More detailed error messages
- [ ] **Performance Optimization**: Reduce bundle size
- [ ] **Accessibility**: Screen reader support

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

### DSEG Font License

The DSEG7 Classic font is created by Keshikan and is used under its license terms. Please refer to the [DSEG Font Website](https://www.keshikan.net/fonts-e.html) for usage rights.

## Acknowledgments

- **Hong Kong Transport Department**: For official taxi fare structure
- **Keshikan**: For the DSEG7 Classic font
- **React Team**: For the excellent React framework
- **Tailwind CSS**: For the utility-first CSS framework
- **Vite Team**: For the fast build tool

## Support

For support, please:
1. Check the [Troubleshooting](#troubleshooting) section
2. Search existing [GitHub Issues](https://github.com/yourusername/hk-taxi-meter/issues)
3. Create a new issue with detailed description

## Disclaimer

This application is for educational and demonstration purposes only. It simulates the Hong Kong taxi fare calculation system but should not be used for actual commercial taxi operations. Always refer to official taxi meters for real fare calculation.

---

**Made with ❤️ for Hong Kong**

*Last updated: May 26, 2025*
