# Custom Chrome New Tab Page (Dashboard)

A visually appealing, lightweight static page intended for use as a new tab page replacement. The dashboard is designed to be mobile-responsive and operates as an installable Progressive Web App (PWA).

## Features

- **Progressive Web App**: Fully functional PWA design enabling installation directly onto Android/iOS devices or desktops. Uses caching via Service Workers for fast loads.
- **Search Integration**: Unified Google Search bar auto-focuses immediately upon opening the tab.
- **Dynamic Status Bar**: 
  - Integrated dual clocks tracking both London and Dubai timezones.
  - Live weather tracking from the Open-Meteo API using beautiful contextual UI icons that respond to daytime/nighttime variations.
- **Bookmarks**: Quick-links covering Workspace apps, Shopping, Tech blogs, and AI services. Also seamlessly dynamically loads high-resolution favicons from Google.
- **Internal Services Hub**: A customized space containing internal networking links (Router, Starlink, Home Assistant, etc.) which securely maps local addresses to their respective product logos.
- **Market Trackers**: Real-time integration of BTC crypto tracking and FTSE 100 quotes.
- **RSS News Feeds**: Live pulling of Hacker News, TechCrunch, and BBC headlines directly into the dashboard columns via RSS-to-JSON parsing.

## Technologies Used

- **HTML5 & CSS3**: Custom glass-morphism aesthetic featuring smooth dark mode hues and CSS grids.
- **Vanilla JavaScript**: Lightweight ES6+ JS managing live clocks, DOM injections, and API fetch executions.
- **Service Worker / PWA**: Native browser caching configuration for standalone capabilities.

## Setup & Deployment

1. Set up a local static server to test (e.g. `npx serve -l 8080`)
2. Modify bookmarks in the `index.html` file as needed.
3. Designed specifically for Firebase Hosting, bound to the custom domain `ghead.co.uk`.

## Planned Roadmap (WIP)
- Add user-configurable states
- Explore additional finance API proxies if AllOrigins becomes rate-limited.
