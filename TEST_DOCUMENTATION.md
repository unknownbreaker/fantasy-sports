# Test Documentation: Popup to Console Feature

## Feature Overview

**Feature Description:** When a user types a message into the popup input field
and clicks the "Send to Page" button, that message should appear in the console
of the active tab's web page.

## Test Files

This feature is covered by three complementary test suites:

### 1. `content.test.js` - Content Script Unit Tests

**Location:** `src/content/content.test.js`

**Purpose:** Tests the content script's message reception and console logging in
isolation.

**Key Test Areas:**

- Message reception from popup
- Console logging with correct format
- Message type filtering
- Response handling
- Edge cases (empty, null, undefined data)
- Console output verification

**Run Command:**

```bash
npm test content.test.js
```

**Example Tests:**

- ✓ Logs received message to console when FROM_POPUP message arrives
- ✓ Logs message data exactly as received from popup
- ✓ Sends response back to popup after processing
- ✓ Handles different data types (string, number, object, array)

---

### 2. `popupToConsole.integration.test.jsx` - Integration Tests

**Location:** `src/popup/popupToConsole.integration.test.jsx`

**Purpose:** Tests the complete message flow from popup UI to content script
console.

**Key Test Areas:**

- Popup-to-content-script communication
- Browser extension messaging system integration
- Message content variations
- User interaction flow
- Console output verification
- Error handling

**Run Command:**

```bash
npm test popupToConsole.integration.test.jsx
```

**Example Tests:**

- ✓ Displays typed message in console when send button is clicked
- ✓ Handles messages with special characters and emoji
- ✓ Sends message with correct structure to content script
- ✓ Updates console on each button click
- ✓ Verifies message reaches correct active tab

---

### 3. `messageConsole.feature.test.jsx` - Feature Test Suite

**Location:** `src/popup/messageConsole.feature.test.jsx`

**Purpose:** Comprehensive end-to-end testing organized by feature modules.

**Test Modules:**

#### Module: User Input Handling

Tests that verify input field functionality

- Accepts various character types
- Updates as user types
- Allows clearing and retyping

#### Module: Button Interaction

Tests that verify send button behavior

- Triggers message transmission on click
- Supports multiple clicks
- Does not send without button click

#### Module: Message Transmission

Tests that verify message sending mechanics

- Sends with correct structure
- Targets active tab
- Transmits exact input value

#### Module: Console Output

Tests that verify console logging

- Displays message with clear prefix
- Logs as separate parameters for readability
- Maintains output for multiple messages

#### Module: Error Handling

Tests that verify graceful failure handling

- Content script not available
- No active tab scenario
- Error recovery

#### Module: Feature Integration (E2E)

Tests that verify complete workflow

- Type → click → console output
- Continuous usage patterns
- State management

#### Module: Data Validation

Tests that verify data integrity

- Preserves exact input value
- Does not add/remove characters
- Handles whitespace correctly

#### Module: Performance

Tests that verify performance characteristics

- Handles rapid successive sends
- Processes messages in order
- Handles long messages efficiently

#### Module: User Experience

Tests that verify good UX

- Provides immediate feedback
- Allows clearing after send
- Maintains input focus

#### Module: Edge Cases

Tests that handle unusual scenarios

- Empty messages
- Whitespace-only content
- Unicode and special characters
- HTML-like content
- Escape characters

**Run Command:**

```bash
npm test messageConsole.feature.test.jsx
```

---

## Running All Tests

### Run All Tests Once

```bash
npm test
```

### Run Tests in Watch Mode

```bash
npm run test:watch
```

### Run Tests with Coverage

```bash
npm run test:coverage
```

### Run Tests with UI

```bash
npm run test:ui
```

### Run Specific Test File

```bash
npm test -- content.test.js
npm test -- popupToConsole.integration
npm test -- messageConsole.feature
```

### Run Tests Matching Pattern

```bash
npm test -- --grep "console output"
npm test -- --grep "user input"
```

---

## Test Organization

### File Structure

```
src/
├── content/
│   ├── content.js                          # Content script implementation
│   └── content.test.js                     # Content script unit tests
└── popup/
    ├── App.jsx                              # Main popup component
    ├── App.integration.test.jsx             # Existing integration tests
    ├── popupToConsole.integration.test.jsx  # NEW: Popup-to-console tests
    └── messageConsole.feature.test.jsx      # NEW: Feature test suite
```

### Test Hierarchy

```
Feature: Popup Message to Console
│
├── Unit Tests (content.test.js)
│   └── Tests content script in isolation
│
├── Integration Tests (popupToConsole.integration.test.jsx)
│   └── Tests popup + content script communication
│
└── Feature Tests (messageConsole.feature.test.jsx)
    └── Tests complete feature organized by modules
```

---

## Key Testing Patterns

### 1. Mocking Browser APIs

```javascript
vi.mock('webextension-polyfill', () => ({
  default: {
    tabs: {
      query: vi.fn(),
      sendMessage: vi.fn(),
    },
    runtime: {
      onMessage: {
        addListener: vi.fn(),
      },
    },
  },
}));
```

### 2. Spying on Console Output

```javascript
const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation();

// Later in test
expect(consoleLogSpy).toHaveBeenCalledWith(
  'Received from popup:',
  'Test message'
);

consoleLogSpy.mockRestore();
```

### 3. Simulating Content Script Behavior

```javascript
browser.tabs.sendMessage.mockImplementation((tabId, message) => {
  if (message.type === 'FROM_POPUP') {
    console.log('Content script received message:', message);
    console.log('Received from popup:', message.data);
  }
  return Promise.resolve({ success: true, echo: message.data });
});
```

### 4. Testing User Interactions

```javascript
const input = screen.getByPlaceholderText('Enter message');
const button = screen.getByRole('button', { name: 'Send to Page' });

fireEvent.change(input, { target: { value: 'Test message' } });
fireEvent.click(button);

await waitFor(() => {
  expect(consoleLogSpy).toHaveBeenCalledWith(
    'Received from popup:',
    'Test message'
  );
});
```

---

## Expected Console Output Format

When a message is successfully sent from the popup to the content script, the
following should appear in the active tab's console:

```
Content script received message: { type: 'FROM_POPUP', data: 'Your message' }
Received from popup: Your message
```

**Important:** The console output uses two separate parameters:

- Parameter 1: String prefix `"Received from popup:"`
- Parameter 2: The actual message data

This format ensures readability in browser developer tools.

---

## Debugging Tests

### View Test Output

```bash
npm test -- --reporter=verbose
```

### Debug Single Test

```javascript
it.only('test name', async () => {
  // This test runs in isolation
});
```

### Check Console Logs During Tests

```javascript
const consoleLogSpy = vi.spyOn(console, 'log');

// After test runs
console.log(consoleLogSpy.mock.calls);
```

### Increase Timeout for Slow Tests

```javascript
await waitFor(
  () => {
    expect(condition).toBeTruthy();
  },
  { timeout: 5000 }
);
```

---

## Test Coverage Goals

| Category          | Target Coverage                         |
| ----------------- | --------------------------------------- |
| Unit Tests        | 100% of content script message handling |
| Integration Tests | 90%+ of popup-to-console flow           |
| Feature Tests     | 95%+ of user-facing functionality       |
| Edge Cases        | All known edge cases covered            |

---

## Continuous Integration

### GitHub Actions Example

```yaml
name: Run Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm test
      - run: npm run test:coverage
```

---

## Common Issues and Solutions

### Issue: Console spy not capturing logs

**Solution:** Ensure spy is set up before the code runs:

```javascript
const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation();
// Now trigger the code that logs
```

### Issue: waitFor timing out

**Solution:** Increase timeout or check async operations:

```javascript
await waitFor(
  () => {
    expect(condition).toBeTruthy();
  },
  { timeout: 3000 }
);
```

### Issue: Mock not being called

**Solution:** Verify mock setup and check if function is actually invoked:

```javascript
expect(browser.tabs.sendMessage).toHaveBeenCalled();
console.log(browser.tabs.sendMessage.mock.calls);
```

### Issue: Tests passing but feature broken

**Solution:** Run integration and feature tests, not just unit tests

---

## Best Practices

1. **Test Isolation:** Each test should be independent
2. **Clear Naming:** Test names should describe what they verify
3. **Arrange-Act-Assert:** Structure tests clearly
4. **Mock External Dependencies:** Use mocks for browser APIs
5. **Clean Up:** Restore spies and clear mocks after tests
6. **Meaningful Assertions:** Test actual behavior, not implementation
7. **Edge Cases:** Always test boundary conditions
8. **Error Scenarios:** Test failure paths as well as success

---

## Contributing New Tests

When adding tests for new features:

1. Add unit tests for isolated functionality
2. Add integration tests for component interaction
3. Add feature tests for user-facing behavior
4. Update this documentation
5. Ensure all tests pass before submitting PR

---

## Questions or Issues?

If tests are failing or you need help:

1. Check test output for specific error messages
2. Review this documentation
3. Run tests in verbose mode: `npm test -- --reporter=verbose`
4. Check existing tests for examples
5. Verify your mock setup matches the actual API
