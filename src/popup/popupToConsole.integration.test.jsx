import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import browser from 'webextension-polyfill';

// Mock webextension-polyfill
vi.mock('webextension-polyfill', () => ({
  default: {
    runtime: {
      onMessage: {
        addListener: vi.fn(),
      },
      sendMessage: vi.fn(),
    },
  },
}));

describe('Content Script - Popup Message Reception', () => {
  let messageListener;
  let consoleLogSpy;
  let mockDocument;
  let mockWindow;

  beforeEach(() => {
    // Setup console.log spy
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation();

    // Setup DOM mocks
    mockDocument = {
      createElement: vi.fn(),
      querySelector: vi.fn(),
      querySelectorAll: vi.fn(),
      body: {
        appendChild: vi.fn(),
      },
      head: {
        appendChild: vi.fn(),
      },
      title: 'Test Page',
      addEventListener: vi.fn(),
    };

    mockWindow = {
      location: {
        href: 'https://example.com',
      },
    };

    // Make DOM mocks globally available
    global.document = mockDocument;
    global.window = mockWindow;

    // Mock setTimeout for message display removal
    vi.useFakeTimers();

    // Capture the message listener when it's registered
    browser.runtime.onMessage.addListener.mockImplementation((listener) => {
      messageListener = listener;
    });

    // Setup createElement to return mock elements
    mockDocument.createElement.mockReturnValue({
      textContent: '',
      style: {
        cssText: '',
      },
    });

    // Clear all mocks
    vi.clearAllMocks();
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  describe('Message Reception and Console Logging', () => {
    it('logs received message to console when FROM_POPUP message arrives', () => {
      // Simulate content script initialization
      require('../content/content.js');

      const testMessage = {
        type: 'FROM_POPUP',
        data: 'Hello from popup',
      };

      const mockSender = { tab: { id: 123 } };
      const mockSendResponse = vi.fn();

      // Trigger the message listener
      messageListener(testMessage, mockSender, mockSendResponse);

      // Verify console.log was called with the correct message
      expect(consoleLogSpy).toHaveBeenCalledWith(
        'Content script received message:',
        testMessage
      );

      expect(consoleLogSpy).toHaveBeenCalledWith(
        'Received from popup:',
        'Hello from popup'
      );
    });

    it('logs message data exactly as received from popup', () => {
      require('../content/content.js');

      const testData = 'Test message content';
      const message = {
        type: 'FROM_POPUP',
        data: testData,
      };

      messageListener(message, {}, vi.fn());

      expect(consoleLogSpy).toHaveBeenCalledWith(
        'Received from popup:',
        testData
      );
    });

    it('logs different message contents correctly', () => {
      require('../content/content.js');

      const testMessages = [
        'First message',
        'Second message with special chars !@#$',
        'Third message with numbers 12345',
        'Message with emoji 🚀',
      ];

      testMessages.forEach((data) => {
        const message = {
          type: 'FROM_POPUP',
          data,
        };

        messageListener(message, {}, vi.fn());

        expect(consoleLogSpy).toHaveBeenCalledWith(
          'Received from popup:',
          data
        );
      });
    });

    it('logs both initial reception and processed message', () => {
      require('../content/content.js');

      const message = {
        type: 'FROM_POPUP',
        data: 'Test content',
      };

      messageListener(message, {}, vi.fn());

      // Should log the full message object first
      expect(consoleLogSpy).toHaveBeenCalledWith(
        'Content script received message:',
        message
      );

      // Then log the specific data
      expect(consoleLogSpy).toHaveBeenCalledWith(
        'Received from popup:',
        'Test content'
      );

      // Verify the order of calls
      const calls = consoleLogSpy.mock.calls;
      const receivedIndex = calls.findIndex(
        (call) => call[0] === 'Content script received message:'
      );
      const processedIndex = calls.findIndex(
        (call) => call[0] === 'Received from popup:'
      );

      expect(receivedIndex).toBeLessThan(processedIndex);
    });
  });

  describe('Message Type Filtering', () => {
    it('only logs when message type is FROM_POPUP', () => {
      require('../content/content.js');

      const wrongTypeMessage = {
        type: 'WRONG_TYPE',
        data: 'Should not be logged',
      };

      messageListener(wrongTypeMessage, {}, vi.fn());

      expect(consoleLogSpy).not.toHaveBeenCalledWith(
        'Received from popup:',
        'Should not be logged'
      );
    });

    it('handles GET_PAGE_INFO without logging popup message', () => {
      require('../content/content.js');

      const pageInfoMessage = {
        type: 'GET_PAGE_INFO',
      };

      messageListener(pageInfoMessage, {}, vi.fn());

      expect(consoleLogSpy).not.toHaveBeenCalledWith(
        expect.stringContaining('Received from popup:'),
        expect.anything()
      );
    });

    it('does not process messages without type property', () => {
      require('../content/content.js');

      const invalidMessage = {
        data: 'No type property',
      };

      messageListener(invalidMessage, {}, vi.fn());

      expect(consoleLogSpy).not.toHaveBeenCalledWith(
        'Received from popup:',
        expect.anything()
      );
    });
  });

  describe('Response Handling', () => {
    it('sends response back to popup after processing', () => {
      require('../content/content.js');

      const message = {
        type: 'FROM_POPUP',
        data: 'Test message',
      };

      const mockSendResponse = vi.fn();

      messageListener(message, {}, mockSendResponse);

      expect(mockSendResponse).toHaveBeenCalledWith({
        success: true,
        echo: 'Test message',
      });
    });

    it('echoes the exact data received in response', () => {
      require('../content/content.js');

      const testData = 'Exact echo test';
      const message = {
        type: 'FROM_POPUP',
        data: testData,
      };

      const mockSendResponse = vi.fn();

      messageListener(message, {}, mockSendResponse);

      const response = mockSendResponse.mock.calls[0][0];
      expect(response.echo).toBe(testData);
    });

    it('returns true to indicate asynchronous response', () => {
      require('../content/content.js');

      const message = {
        type: 'FROM_POPUP',
        data: 'Test',
      };

      const result = messageListener(message, {}, vi.fn());

      expect(result).toBe(true);
    });
  });

  describe('End-to-End Message Flow', () => {
    it('completes full flow: receive → log → display → respond', () => {
      require('../content/content.js');

      const testData = 'Full flow test';
      const message = {
        type: 'FROM_POPUP',
        data: testData,
      };

      const mockSendResponse = vi.fn();

      // Trigger message
      const result = messageListener(message, {}, mockSendResponse);

      // Verify logging occurred
      expect(consoleLogSpy).toHaveBeenCalledWith(
        'Received from popup:',
        testData
      );

      // Verify response was sent
      expect(mockSendResponse).toHaveBeenCalledWith({
        success: true,
        echo: testData,
      });

      // Verify async response indicator
      expect(result).toBe(true);
    });

    it('handles multiple sequential messages correctly', () => {
      require('../content/content.js');

      const messages = [
        { type: 'FROM_POPUP', data: 'Message 1' },
        { type: 'FROM_POPUP', data: 'Message 2' },
        { type: 'FROM_POPUP', data: 'Message 3' },
      ];

      messages.forEach((msg) => {
        const mockSendResponse = vi.fn();
        messageListener(msg, {}, mockSendResponse);

        expect(consoleLogSpy).toHaveBeenCalledWith(
          'Received from popup:',
          msg.data
        );
        expect(mockSendResponse).toHaveBeenCalledWith({
          success: true,
          echo: msg.data,
        });
      });

      // Verify all three messages were logged
      expect(consoleLogSpy).toHaveBeenCalledTimes(messages.length * 2);
    });
  });

  describe('Edge Cases and Error Scenarios', () => {
    it('handles empty string data', () => {
      require('../content/content.js');

      const message = {
        type: 'FROM_POPUP',
        data: '',
      };

      messageListener(message, {}, vi.fn());

      expect(consoleLogSpy).toHaveBeenCalledWith('Received from popup:', '');
    });

    it('handles numeric data', () => {
      require('../content/content.js');

      const message = {
        type: 'FROM_POPUP',
        data: 12345,
      };

      messageListener(message, {}, vi.fn());

      expect(consoleLogSpy).toHaveBeenCalledWith('Received from popup:', 12345);
    });

    it('handles null data', () => {
      require('../content/content.js');

      const message = {
        type: 'FROM_POPUP',
        data: null,
      };

      messageListener(message, {}, vi.fn());

      expect(consoleLogSpy).toHaveBeenCalledWith('Received from popup:', null);
    });

    it('handles undefined data', () => {
      require('../content/content.js');

      const message = {
        type: 'FROM_POPUP',
        data: undefined,
      };

      messageListener(message, {}, vi.fn());

      expect(consoleLogSpy).toHaveBeenCalledWith(
        'Received from popup:',
        undefined
      );
    });

    it('handles object data', () => {
      require('../content/content.js');

      const objectData = { text: 'Hello', count: 5 };
      const message = {
        type: 'FROM_POPUP',
        data: objectData,
      };

      messageListener(message, {}, vi.fn());

      expect(consoleLogSpy).toHaveBeenCalledWith(
        'Received from popup:',
        objectData
      );
    });

    it('handles array data', () => {
      require('../content/content.js');

      const arrayData = ['item1', 'item2', 'item3'];
      const message = {
        type: 'FROM_POPUP',
        data: arrayData,
      };

      messageListener(message, {}, vi.fn());

      expect(consoleLogSpy).toHaveBeenCalledWith(
        'Received from popup:',
        arrayData
      );
    });

    it('handles very long string data', () => {
      require('../content/content.js');

      const longString = 'A'.repeat(10000);
      const message = {
        type: 'FROM_POPUP',
        data: longString,
      };

      messageListener(message, {}, vi.fn());

      expect(consoleLogSpy).toHaveBeenCalledWith(
        'Received from popup:',
        longString
      );
    });

    it('handles special characters and unicode', () => {
      require('../content/content.js');

      const specialData = '特殊字符 🎉 \n\t\r\\"\' <script>';
      const message = {
        type: 'FROM_POPUP',
        data: specialData,
      };

      messageListener(message, {}, vi.fn());

      expect(consoleLogSpy).toHaveBeenCalledWith(
        'Received from popup:',
        specialData
      );
    });
  });

  describe('Console Visibility Verification', () => {
    it('ensures console.log output is visible in active tab console', () => {
      require('../content/content.js');

      const message = {
        type: 'FROM_POPUP',
        data: 'Visible in console',
      };

      messageListener(message, {}, vi.fn());

      // Verify the exact console.log signature that developers will see
      const logCalls = consoleLogSpy.mock.calls;
      const popupLogCall = logCalls.find(
        (call) => call[0] === 'Received from popup:'
      );

      expect(popupLogCall).toBeDefined();
      expect(popupLogCall[1]).toBe('Visible in console');
    });

    it('verifies console log format matches expected developer tools output', () => {
      require('../content/content.js');

      const testData = 'Format verification';
      const message = {
        type: 'FROM_POPUP',
        data: testData,
      };

      messageListener(message, {}, vi.fn());

      // Check that console.log is called with separate parameters
      // (not concatenated string) for better dev tools formatting
      const logCall = consoleLogSpy.mock.calls.find(
        (call) => call[0] === 'Received from popup:'
      );

      expect(logCall).toHaveLength(2);
      expect(logCall[0]).toBe('Received from popup:');
      expect(logCall[1]).toBe(testData);
    });
  });
});
