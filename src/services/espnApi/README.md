# ESPN API Module

This module provides functionality to fetch ESPN Fantasy Football league data
from the active tab and return it to the Firefox addon.

## Module Structure

```
src/
├── services/
│   └── espnApi/
│       ├── espnApiService.js              # Core API fetch functionality
│       ├── espnApiService.test.js         # Co-located tests
│       ├── espnMessageHandler.js          # Message handling for popup communication
│       └── espnMessageHandler.test.js     # Co-located tests
├── popup/
│   ├── components/
│   │   ├── EspnLeagueData.jsx             # React component for UI
│   │   └── EspnLeagueData.test.jsx        # Co-located tests
│   └── styles/
│       └── espnLeagueData.scss            # Component styles
└── background/
    └── background.js                       # Updated with ESPN handler
```

## Features

### ESPN API Service (`espnApiService.js`)

**Purpose:** Execute fetch requests in the active tab context to retrieve ESPN
Fantasy Football data.

**Key Functions:**

- `buildEspnApiUrl(leagueId)` - Constructs the ESPN API URL
- `executeEspnFetch(leagueId)` - Executes fetch in active tab and returns JSON
- `isValidLeagueId(leagueId)` - Validates league ID format

**Configuration:**

```javascript
const ESPN_API_CONFIG = {
  BASE_URL: 'https://lm-api-reads.fantasy.espn.com',
  GAME: 'ffl',
  SEASON: 2025,
  SEGMENT: 0,
};
```

### Message Handler (`espnMessageHandler.js`)

**Purpose:** Handle communication between popup and background script for ESPN
data fetching.

**Message Types:**

- `ESPN_FETCH_LEAGUE_DATA` - Request to fetch league data
- `ESPN_LEAGUE_DATA_SUCCESS` - Successful fetch response
- `ESPN_LEAGUE_DATA_ERROR` - Error response

**Key Functions:**

- `handleEspnFetchRequest(message, sender)` - Processes fetch requests
- `registerEspnMessageHandler()` - Registers listener with browser runtime

### React Component (`EspnLeagueData.jsx`)

**Purpose:** User interface for entering league ID and displaying fetched data.

**Features:**

- Input field with default league ID (59986587)
- Form validation (disables button when empty)
- Loading states during fetch
- Error handling with user-friendly messages
- JSON data display with syntax highlighting

## Usage

### 1. Import and Register Handler in Background Script

```javascript
// src/background/background.js
import { registerEspnMessageHandler } from '../services/espnApi/espnMessageHandler';

registerEspnMessageHandler();
```

### 2. Add Component to Popup

```javascript
// src/popup/App.jsx
import EspnLeagueData from './components/EspnLeagueData';

function App() {
  return (
    <div>
      <EspnLeagueData />
    </div>
  );
}
```

### 3. Import Styles

```scss
// src/popup/styles/main.scss
@import './espnLeagueData.scss';
```

## Testing

Run all tests:

```bash
npm test
```

Run specific test files:

```bash
npm test espnApiService.test.js
npm test espnMessageHandler.test.js
npm test EspnLeagueData.test.jsx
```

### Test Coverage

**Service Tests:**

- ✅ Successful API fetch
- ✅ Error handling (network errors, missing tab)
- ✅ Input validation
- ✅ URL construction
- ✅ Credentials inclusion

**Message Handler Tests:**

- ✅ Message type filtering
- ✅ Successful fetch response
- ✅ Error responses
- ✅ Async message handling
- ✅ Handler registration

**Component Tests:**

- ✅ Initial render with default values
- ✅ User input handling
- ✅ Form validation
- ✅ Loading states
- ✅ Success data display
- ✅ Error message display
- ✅ Retry after error

## How It Works

### Fetch Flow

1. **User Action**: User enters league ID and clicks "Fetch League Data"

2. **Component → Background**: Component sends message via
   `browser.runtime.sendMessage()`

   ```javascript
   {
     type: 'ESPN_FETCH_LEAGUE_DATA',
     leagueId: '59986587'
   }
   ```

3. **Background Script**: Message handler receives request and calls
   `executeEspnFetch()`

4. **Active Tab Execution**: Background script uses
   `browser.tabs.executeScript()` to run fetch in the active tab

   ```javascript
   fetch('https://lm-api-reads.fantasy.espn.com/.../leagues/59986587', {
     credentials: 'include',
   });
   ```

5. **Response**: JSON data is returned through the message system back to the
   component

6. **Display**: Component displays the league data or error message

### Why Execute in Active Tab?

The fetch must be executed in the active tab context (not the background script)
because:

- The ESPN API requires cookies for authentication (`credentials: "include"`)
- Cookies are tied to the domain and tab context
- Background scripts don't share the same cookie context as tabs

## API Response Example

```json
{
  "id": "59986587",
  "seasonId": 2025,
  "segmentId": 0,
  "members": [
    {
      "id": "...",
      "displayName": "Team Owner",
      "firstName": "John",
      "lastName": "Doe"
    }
  ],
  "teams": [
    {
      "id": 1,
      "name": "Team Name",
      "roster": { ... }
    }
  ],
  "schedule": [ ... ],
  "settings": { ... }
}
```

## Error Handling

The module handles several error cases:

- **No Active Tab**: When no browser tab is active
- **Invalid League ID**: When league ID is empty or invalid format
- **Network Errors**: When fetch fails (timeout, 404, 500, etc.)
- **JSON Parsing**: When response is not valid JSON
- **Authentication**: When ESPN API returns 401/403

All errors are caught and returned as user-friendly messages in the UI.

## Configuration

To modify the ESPN API endpoint or season:

```javascript
// src/services/espnApi/espnApiService.js
const ESPN_API_CONFIG = {
  BASE_URL: 'https://lm-api-reads.fantasy.espn.com',
  GAME: 'ffl', // Change for different sports
  SEASON: 2025, // Update for different season
  SEGMENT: 0, // Regular season (0) or playoffs
};
```

## Security Considerations

- League data fetching requires user authentication via ESPN cookies
- The extension only reads data; it never modifies or writes
- All requests use `credentials: "include"` to respect user's login session
- No sensitive data is stored in the extension

## Future Enhancements

Potential improvements:

- Add query parameters support (e.g., view options)
- Cache recent league data
- Support multiple league IDs at once
- Export data to CSV/JSON file
- Add data visualization components
- Support other ESPN fantasy sports (NBA, MLB, NHL)

## License

MIT
