# Fantasy Sports Helper

A modern Firefox extension built with React, Vite, React Query, React Table,
SCSS, and Vitest for testing.

## Features

- ⚛️ **React 18** - Modern React with hooks
- ⚡ **Vite** - Lightning fast HMR and builds
- 🔄 **React Query** - Powerful data synchronization
- 📊 **React Table** - Flexible table component
- 🎨 **SCSS** - Enhanced CSS with variables and mixins
- 🧪 **Vitest** - Fast unit testing
- 🔌 **WebExtension Polyfill** - Cross-browser compatibility
- ✨ **ESLint** - Code linting with Firefox addon rules
- 💅 **Prettier** - Consistent code formatting

## Project Structure

```
firefox-addon-react/
├── public/
│   └── icons/              # Extension icons
│       ├── icon-16.png
│       ├── icon-32.png
│       ├── icon-48.png
│       └── icon-96.png
├── popup/
│   └── index.html          # Popup HTML entry
├── src/
│   ├── popup/
│   │   ├── components/
│   │   │   ├── MessageForm.jsx
│   │   │   ├── MessageForm.test.jsx
│   │   │   ├── MessagesTable.jsx
│   │   │   └── PageInfo.jsx
│   │   ├── styles/
│   │   │   └── main.scss
│   │   ├── App.jsx
│   │   ├── App.test.jsx
│   │   └── main.jsx
│   ├── content/
│   │   └── content.js      # Content script
│   └── background/
│       └── background.js   # Background script
├── manifest.json           # Extension manifest
├── package.json
├── vite.config.js
├── vitest.setup.js
└── README.md
```

## Installation

1. Install dependencies:

```bash
npm install
```

2. Build the extension:

```bash
npm run build
```

3. Load in Firefox:
   - Open Firefox and navigate to `about:debugging`
   - Click "This Firefox"
   - Click "Load Temporary Add-on"
   - Select the `manifest.json` file from the `dist` folder

## Development

### Run in development mode:

```bash
npm run dev
```

### Linting and Formatting:

```bash
# Check for linting errors
npm run lint

# Fix linting errors automatically
npm run lint:fix

# Format code with Prettier
npm run format

# Check if code is formatted correctly
npm run format:check
```

### Run tests:

```bash
npm test
```

### Run tests with UI:

```bash
npm run test:ui
```

### Build for production:

```bash
npm run build
```

## How It Works

### Communication Flow

1. **Popup → Content Script**:
   - User types a message in the popup
   - React Query mutation sends message via `browser.tabs.sendMessage()`
   - Content script receives and displays message on page

2. **Content Script → Popup**:
   - Content script listens for page events (clicks)
   - Sends data to popup via `browser.runtime.sendMessage()`
   - Popup displays messages in React Table

3. **Page Info Query**:
   - Popup uses React Query to fetch page information
   - Content script responds with URL, title, and element count

### Key Components

- **App.jsx**: Main popup component with React Query setup
- **MessageForm.jsx**: Form for sending messages to content script
- **MessagesTable.jsx**: React Table displaying messages from page
- **PageInfo.jsx**: Displays current page information
- **content.js**: Runs in page context, handles DOM manipulation
- **background.js**: Persistent background script for extension-wide logic

## Technologies

- **React 18.3.1** - UI framework
- **Vite 5.4.7** - Build tool
- **@tanstack/react-query 5.56.2** - Data fetching and state management
- **@tanstack/react-table 8.20.5** - Headless table library
- **Sass 1.79.3** - CSS preprocessor
- **Vitest 2.1.1** - Unit testing framework
- **webextension-polyfill 0.12.0** - Cross-browser WebExtension API
- **ESLint 8.57.0** - Linting with Firefox addon specific rules
- **Prettier 3.3.3** - Code formatting

## Testing

The project includes example tests for components:

- `App.test.jsx` - Tests main app functionality
- `MessageForm.test.jsx` - Tests form interactions and validation

Run tests with:

```bash
npm test
```

## Building for Production

When you run `npm run build`, Vite will:

1. Bundle all React components
2. Compile SCSS to CSS
3. Output to `dist/` folder
4. Generate optimized production builds

The `dist/` folder can then be packaged and submitted to Firefox Add-ons.

## Code Quality

This project is configured with ESLint and Prettier to maintain code quality and
consistency:

### ESLint Configuration

- **React rules** - Proper hooks usage and JSX syntax
- **WebExtensions environment** - Proper global recognition for `browser` and
  `chrome` APIs
- **Import rules** - Organized imports with alphabetical ordering
- **Accessibility rules** - WCAG compliance checks (via eslint-plugin-jsx-a11y)
- **React Query rules** - Best practices for data fetching

Key WebExtension rules enforced:

- Prevents use of `localStorage` and `sessionStorage` (use `browser.storage` API
  instead)
- Recognizes `browser` and `chrome` as valid global objects
- Proper `webextensions` environment configuration

### Prettier Configuration

Ensures consistent formatting across:

- JavaScript/JSX files
- SCSS/CSS files
- JSON files
- Markdown files

### VS Code Integration

The `.vscode/` folder includes:

- Auto-format on save
- ESLint auto-fix on save
- Recommended extensions

## License

MIT
