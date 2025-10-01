# ESPN API Module Setup Guide

Follow these steps to integrate the ESPN API module into your Firefox addon.

## Step 1: Create Directory Structure

Create the necessary directories if they don't exist:

```bash
mkdir -p src/services/espnApi
mkdir -p src/popup/components
```

## Step 2: Add Service Files

Copy these files to your project (tests are co-located with their source files):

1. **`src/services/espnApi/espnApiService.js`** - Core API service
2. **`src/services/espnApi/espnApiService.test.js`** - Service tests
   (co-located)
3. **`src/services/espnApi/espnMessageHandler.js`** - Message handler
4. **`src/services/espnApi/espnMessageHandler.test.js`** - Handler tests
   (co-located)

## Step 3: Add React Component

Copy these files (test is co-located with the component):

1. **`src/popup/components/EspnLeagueData.jsx`** - React component
2. **`src/popup/components/EspnLeagueData.test.jsx`** - Component tests
   (co-located)
3. **`src/popup/styles/espnLeagueData.scss`** - Component styles

## Step 4: Update Background Script

Replace your `src/background/background.js` with the updated version, or add
this import at the top:

```javascript
import { registerEspnMessageHandler } from '../services/espnApi/espnMessageHandler';

// Call this after other initialization
registerEspnMessageHandler();
```

## Step 5: Update Manifest Permissions

Ensure your `manifest.json` includes these permissions (Manifest V3):

```json
{
  "manifest_version": 3,
  "permissions": ["tabs", "activeTab", "scripting"],
  "host_permissions": ["<all_urls>"],
  "background": {
    "scripts": ["background.js"],
    "type": "module"
  }
}
```

**Required Permissions:**

- `tabs` - Query active tabs
- `activeTab` - Access to the active tab
- `scripting` - Execute scripts in tabs (replaces executeScript in MV3)
- `<all_urls>` in host_permissions - Access to all URLs for script execution

**Note:** If your project is still using Manifest V2, you would use:

```json
{
  "manifest_version": 2,
  "permissions": ["tabs", "activeTab", "<all_urls>"],
  "background": {
    "scripts": ["background.js"]
  },
  "browser_action": { ... }
}
```

## Step 6: Import Styles

Add to your `src/popup/styles/main.scss`:

```scss
@import './espnLeagueData.scss';
```

## Step 7: Add Component to Popup

Update your `src/popup/App.jsx`:

```javascript
import EspnLeagueData from './components/EspnLeagueData';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="app">
        {/* Your existing components */}

        <EspnLeagueData />
      </div>
    </QueryClientProvider>
  );
}
```

## Step 8: Install Testing Dependencies (if needed)

Make sure you have the required testing libraries:

```bash
npm install --save-dev @testing-library/user-event
```

Check your `package.json` includes:

- `@testing-library/react`
- `@testing-library/jest-dom`
- `vitest`
- `@vitest/ui`

## Step 9: Run Tests

Verify everything is working:

```bash
# Run all tests
npm test

# Run ESPN module tests specifically
npm test espnApi

# Run with UI
npm run test:ui
```

## Step 10: Build and Test Extension

Build the extension:

```bash
npm run build
```

Load in Firefox:

1. Open `about:debugging`
2. Click "This Firefox"
3. Click "Load Temporary Add-on"
4. Select `manifest.json` from the `dist` folder

## Verification Checklist

- [ ] All test files pass
- [ ] No ESLint errors (`npm run lint`)
- [ ] Extension builds successfully
- [ ] Component appears in popup
- [ ] Can enter league ID
- [ ] Fetch button is enabled/disabled correctly
- [ ] Loading state appears during fetch
- [ ] Data displays after successful fetch
- [ ] Error messages display on failure

## Troubleshooting

### Tests Fail with "browser is not defined"

Make sure `vitest.setup.js` includes the browser mock:

```javascript
import { vi } from 'vitest';

global.browser = {
  runtime: {
    sendMessage: vi.fn(),
    onMessage: {
      addListener: vi.fn(),
    },
  },
  tabs: {
    query: vi.fn(),
    executeScript: vi.fn(),
  },
};
```

### "Cannot find module 'webextension-polyfill'"

Install the dependency:

```bash
npm install webextension-polyfill
```

### executeScript Permission Error

For Manifest V3, ensure manifest.json includes:

```json
{
  "permissions": ["tabs", "activeTab", "scripting"],
  "host_permissions": ["<all_urls>"]
}
```

For Manifest V2, ensure manifest.json includes:

```json
{
  "permissions": ["tabs", "activeTab", "<all_urls>"]
}
```

### CORS Error in Browser

This is normal. The fetch is executed in the active tab's context, so it should
have access to ESPN's cookies. Make sure you're logged into ESPN in the browser.

### Component Not Rendering

Check that:

1. Component is imported in App.jsx
2. Styles are imported in main.scss
3. QueryClient is properly set up
4. No console errors in browser devtools

## Development Tips

### Debugging

Enable verbose logging in background script:

```javascript
// src/services/espnApi/espnApiService.js
export async function executeEspnFetch(leagueId) {
  console.log('[ESPN API] Fetching league:', leagueId);
  // ... rest of code
}
```

### Testing with Different Leagues

Update the default league ID in the component:

```javascript
const [leagueId, setLeagueId] = useState('YOUR_LEAGUE_ID');
```

### Modifying API Configuration

Edit `ESPN_API_CONFIG` in `espnApiService.js`:

```javascript
const ESPN_API_CONFIG = {
  SEASON: 2026, // Update for new season
  SEGMENT: 1, // Change to playoffs
};
```

## Next Steps

Once the module is working:

1. **Add more features** - Query parameters, filters, date ranges
2. **Improve UI** - Add data visualization, tables, charts
3. **Add caching** - Store recent league data in browser.storage
4. **Support more sports** - Basketball, Baseball, Hockey
5. **Export functionality** - Download data as JSON/CSV

## Support

For issues or questions:

- Check the module README
- Review test files for usage examples
- Check browser console for errors
- Verify all permissions are set correctly
