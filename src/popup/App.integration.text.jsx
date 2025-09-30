import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import browser from 'webextension-polyfill';
import App from './App';

// Mock the webextension-polyfill
vi.mock('webextension-polyfill', () => ({
  default: {
    tabs: {
      query: vi.fn(),
      sendMessage: vi.fn(),
    },
    runtime: {
      onMessage: {
        addListener: vi.fn(),
        removeListener: vi.fn(),
      },
      sendMessage: vi.fn(),
    },
  },
}));

describe('App Data Communication Tests', () => {
  let queryClient;
  let mockMessageListener;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    // Reset all mocks
    vi.clearAllMocks();

    // Default mock implementations
    browser.tabs.query.mockResolvedValue([{ id: 123 }]);
    browser.tabs.sendMessage.mockResolvedValue({
      url: 'https://example.com',
      title: 'Example Domain',
      elementCount: 42,
    });

    // Capture the message listener for testing
    browser.runtime.onMessage.addListener.mockImplementation((listener) => {
      mockMessageListener = listener;
    });
  });

  afterEach(() => {
    mockMessageListener = null;
  });

  describe('Popup → Content Script Communication', () => {
    it('sends message to active tab with correct data structure', async () => {
      browser.tabs.sendMessage.mockResolvedValue({
        success: true,
        echo: 'Hello from popup',
      });

      render(
        <QueryClientProvider client={queryClient}>
          <App />
        </QueryClientProvider>
      );

      const input = screen.getByPlaceholderText('Enter message');
      const button = screen.getByText('Send to Page');

      fireEvent.change(input, { target: { value: 'Hello from popup' } });
      fireEvent.click(button);

      await waitFor(() => {
        expect(browser.tabs.sendMessage).toHaveBeenCalledWith(123, {
          type: 'FROM_POPUP',
          data: 'Hello from popup',
        });
      });
    });

    it('queries for active tab before sending message', async () => {
      browser.tabs.sendMessage.mockResolvedValue({ success: true });

      render(
        <QueryClientProvider client={queryClient}>
          <App />
        </QueryClientProvider>
      );

      const input = screen.getByPlaceholderText('Enter message');
      const button = screen.getByText('Send to Page');

      fireEvent.change(input, { target: { value: 'Test' } });
      fireEvent.click(button);

      await waitFor(() => {
        expect(browser.tabs.query).toHaveBeenCalledWith({
          active: true,
          currentWindow: true,
        });
      });
    });

    it('handles successful response from content script', async () => {
      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation();

      browser.tabs.sendMessage.mockResolvedValue({
        success: true,
        echo: 'Test message',
      });

      render(
        <QueryClientProvider client={queryClient}>
          <App />
        </QueryClientProvider>
      );

      const input = screen.getByPlaceholderText('Enter message');
      const button = screen.getByText('Send to Page');

      fireEvent.change(input, { target: { value: 'Test message' } });
      fireEvent.click(button);

      await waitFor(() => {
        expect(consoleLogSpy).toHaveBeenCalledWith(
          'Message sent successfully:',
          { success: true, echo: 'Test message' }
        );
      });

      consoleLogSpy.mockRestore();
    });

    it('handles error when content script fails', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation();
      const errorMessage = new Error('Content script not responding');

      browser.tabs.sendMessage.mockRejectedValue(errorMessage);

      render(
        <QueryClientProvider client={queryClient}>
          <App />
        </QueryClientProvider>
      );

      const input = screen.getByPlaceholderText('Enter message');
      const button = screen.getByText('Send to Page');

      fireEvent.change(input, { target: { value: 'Test' } });
      fireEvent.click(button);

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          'Error sending message:',
          errorMessage
        );
      });

      consoleErrorSpy.mockRestore();
    });

    it('sends multiple messages in sequence', async () => {
      browser.tabs.sendMessage.mockResolvedValue({ success: true });

      render(
        <QueryClientProvider client={queryClient}>
          <App />
        </QueryClientProvider>
      );

      const input = screen.getByPlaceholderText('Enter message');
      const button = screen.getByText('Send to Page');

      // Send first message
      fireEvent.change(input, { target: { value: 'Message 1' } });
      fireEvent.click(button);

      await waitFor(() => {
        expect(browser.tabs.sendMessage).toHaveBeenCalledWith(123, {
          type: 'FROM_POPUP',
          data: 'Message 1',
        });
      });

      // Send second message
      fireEvent.change(input, { target: { value: 'Message 2' } });
      fireEvent.click(button);

      await waitFor(() => {
        expect(browser.tabs.sendMessage).toHaveBeenCalledWith(123, {
          type: 'FROM_POPUP',
          data: 'Message 2',
        });
      });

      expect(browser.tabs.sendMessage).toHaveBeenCalledTimes(2);
    });
  });

  describe('Content Script → Popup Communication', () => {
    it('receives and displays messages from content script', async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <App />
        </QueryClientProvider>
      );

      // Verify listener was registered
      expect(browser.runtime.onMessage.addListener).toHaveBeenCalled();

      // Simulate content script sending a message
      const message = {
        type: 'FROM_CONTENT',
        data: 'Button clicked',
      };

      mockMessageListener(message, { tab: { id: 123 } });

      await waitFor(() => {
        expect(screen.getByText('Button clicked')).toBeDefined();
      });
    });

    it('correctly formats received messages with timestamp', async () => {
      const mockDate = new Date('2025-01-15T10:30:00');
      vi.spyOn(global, 'Date').mockImplementation(() => mockDate);
      vi.spyOn(mockDate, 'toLocaleTimeString').mockReturnValue('10:30:00 AM');

      render(
        <QueryClientProvider client={queryClient}>
          <App />
        </QueryClientProvider>
      );

      const message = {
        type: 'FROM_CONTENT',
        data: 'Test event',
      };

      mockMessageListener(message, { tab: { id: 123 } });

      await waitFor(() => {
        expect(screen.getByText('10:30:00 AM')).toBeDefined();
      });

      vi.restoreAllMocks();
    });

    it('handles multiple messages from content script', async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <App />
        </QueryClientProvider>
      );

      // Send first message
      mockMessageListener(
        { type: 'FROM_CONTENT', data: 'First message' },
        { tab: { id: 123 } }
      );

      // Send second message
      mockMessageListener(
        { type: 'FROM_CONTENT', data: 'Second message' },
        { tab: { id: 123 } }
      );

      // Send third message
      mockMessageListener(
        { type: 'FROM_CONTENT', data: 'Third message' },
        { tab: { id: 123 } }
      );

      await waitFor(() => {
        expect(screen.getByText('First message')).toBeDefined();
        expect(screen.getByText('Second message')).toBeDefined();
        expect(screen.getByText('Third message')).toBeDefined();
      });
    });

    it('displays messages in reverse chronological order', async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <App />
        </QueryClientProvider>
      );

      // Send messages in sequence
      mockMessageListener(
        { type: 'FROM_CONTENT', data: 'Oldest message' },
        { tab: { id: 123 } }
      );

      await waitFor(() => {
        expect(screen.getByText('Oldest message')).toBeDefined();
      });

      mockMessageListener(
        { type: 'FROM_CONTENT', data: 'Newest message' },
        { tab: { id: 123 } }
      );

      await waitFor(() => {
        const messages = screen.getAllByText(/message/i);
        expect(messages[0].textContent).toContain('Newest message');
      });
    });

    it('ignores messages that are not FROM_CONTENT type', async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <App />
        </QueryClientProvider>
      );

      // Send message with different type
      mockMessageListener(
        { type: 'UNKNOWN_TYPE', data: 'Should be ignored' },
        { tab: { id: 123 } }
      );

      // Wait a bit to ensure message is not rendered
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(screen.queryByText('Should be ignored')).toBeNull();
    });

    it('cleans up message listener on unmount', () => {
      const { unmount } = render(
        <QueryClientProvider client={queryClient}>
          <App />
        </QueryClientProvider>
      );

      unmount();

      expect(browser.runtime.onMessage.removeListener).toHaveBeenCalledWith(
        mockMessageListener
      );
    });
  });

  describe('Page Info Query', () => {
    it('fetches page info on mount', async () => {
      browser.tabs.sendMessage.mockResolvedValue({
        url: 'https://test.com',
        title: 'Test Page',
        elementCount: 100,
      });

      render(
        <QueryClientProvider client={queryClient}>
          <App />
        </QueryClientProvider>
      );

      await waitFor(() => {
        expect(browser.tabs.query).toHaveBeenCalledWith({
          active: true,
          currentWindow: true,
        });
      });

      await waitFor(() => {
        expect(browser.tabs.sendMessage).toHaveBeenCalledWith(123, {
          type: 'GET_PAGE_INFO',
        });
      });
    });

    it('displays fetched page info correctly', async () => {
      browser.tabs.sendMessage.mockResolvedValue({
        url: 'https://github.com/user/repo',
        title: 'GitHub Repository',
        elementCount: 500,
      });

      render(
        <QueryClientProvider client={queryClient}>
          <App />
        </QueryClientProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('https://github.com/user/repo')).toBeDefined();
        expect(screen.getByText('GitHub Repository')).toBeDefined();
        expect(screen.getByText('500')).toBeDefined();
      });
    });

    it('shows loading state while fetching page info', () => {
      browser.tabs.sendMessage.mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );

      render(
        <QueryClientProvider client={queryClient}>
          <App />
        </QueryClientProvider>
      );

      expect(screen.getByText('Loading page info...')).toBeDefined();
    });

    it('handles page info fetch error', async () => {
      browser.tabs.sendMessage.mockRejectedValue(
        new Error('Could not access page')
      );

      render(
        <QueryClientProvider client={queryClient}>
          <App />
        </QueryClientProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Unable to access page info')).toBeDefined();
      });
    });

    it('sends correct message type for page info request', async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <App />
        </QueryClientProvider>
      );

      await waitFor(() => {
        const calls = browser.tabs.sendMessage.mock.calls;
        const pageInfoCall = calls.find(
          (call) => call[1].type === 'GET_PAGE_INFO'
        );
        expect(pageInfoCall).toBeDefined();
      });
    });
  });

  describe('Bidirectional Communication Flow', () => {
    it('handles full roundtrip: popup sends, content responds, popup receives', async () => {
      browser.tabs.sendMessage.mockResolvedValue({
        success: true,
        echo: 'Response from content',
      });

      render(
        <QueryClientProvider client={queryClient}>
          <App />
        </QueryClientProvider>
      );

      // Popup sends message
      const input = screen.getByPlaceholderText('Enter message');
      const button = screen.getByText('Send to Page');

      fireEvent.change(input, { target: { value: 'Hello' } });
      fireEvent.click(button);

      await waitFor(() => {
        expect(browser.tabs.sendMessage).toHaveBeenCalledWith(123, {
          type: 'FROM_POPUP',
          data: 'Hello',
        });
      });

      // Content script sends message back
      mockMessageListener(
        { type: 'FROM_CONTENT', data: 'Response from content' },
        { tab: { id: 123 } }
      );

      await waitFor(() => {
        expect(screen.getByText('Response from content')).toBeDefined();
      });
    });

    it('maintains separate message streams for sent and received', async () => {
      browser.tabs.sendMessage.mockResolvedValue({ success: true });

      render(
        <QueryClientProvider client={queryClient}>
          <App />
        </QueryClientProvider>
      );

      // Send from popup
      const input = screen.getByPlaceholderText('Enter message');
      const button = screen.getByText('Send to Page');

      fireEvent.change(input, { target: { value: 'Sent message' } });
      fireEvent.click(button);

      // Receive from content
      mockMessageListener(
        { type: 'FROM_CONTENT', data: 'Received message' },
        { tab: { id: 123 } }
      );

      await waitFor(() => {
        expect(screen.getByText('Received message')).toBeDefined();
      });

      // Sent message should not appear in received messages table
      const messagesTable =
        screen.getByText('Messages from Page').parentElement;
      expect(messagesTable.textContent).toContain('Received message');
      expect(messagesTable.textContent).not.toContain('Sent message');
    });

    it('handles concurrent send and receive operations', async () => {
      browser.tabs.sendMessage.mockResolvedValue({ success: true });

      render(
        <QueryClientProvider client={queryClient}>
          <App />
        </QueryClientProvider>
      );

      const input = screen.getByPlaceholderText('Enter message');
      const button = screen.getByText('Send to Page');

      // Send first message
      fireEvent.change(input, { target: { value: 'Send 1' } });
      fireEvent.click(button);

      // Receive message while sending
      mockMessageListener(
        { type: 'FROM_CONTENT', data: 'Receive 1' },
        { tab: { id: 123 } }
      );

      // Send second message
      fireEvent.change(input, { target: { value: 'Send 2' } });
      fireEvent.click(button);

      // Receive another message
      mockMessageListener(
        { type: 'FROM_CONTENT', data: 'Receive 2' },
        { tab: { id: 123 } }
      );

      await waitFor(() => {
        expect(screen.getByText('Receive 1')).toBeDefined();
        expect(screen.getByText('Receive 2')).toBeDefined();
      });

      expect(browser.tabs.sendMessage).toHaveBeenCalledTimes(2);
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('handles tab query failure', async () => {
      browser.tabs.query.mockRejectedValue(new Error('No active tab'));

      render(
        <QueryClientProvider client={queryClient}>
          <App />
        </QueryClientProvider>
      );

      const input = screen.getByPlaceholderText('Enter message');
      const button = screen.getByText('Send to Page');

      fireEvent.change(input, { target: { value: 'Test' } });
      fireEvent.click(button);

      await waitFor(() => {
        expect(browser.tabs.query).toHaveBeenCalled();
      });
    });

    it('handles empty tab query result', async () => {
      browser.tabs.query.mockResolvedValue([]);

      render(
        <QueryClientProvider client={queryClient}>
          <App />
        </QueryClientProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Unable to access page info')).toBeDefined();
      });
    });

    it('handles malformed messages from content script', async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <App />
        </QueryClientProvider>
      );

      // Send message without required fields
      mockMessageListener({ type: 'FROM_CONTENT' }, { tab: { id: 123 } });

      // Should not crash and should not display undefined
      await new Promise((resolve) => setTimeout(resolve, 100));

      const tableBody = screen.getByText('Messages from Page').parentElement;
      expect(tableBody.textContent).not.toContain('undefined');
    });

    it('handles rapid successive messages', async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <App />
        </QueryClientProvider>
      );

      // Send 10 messages rapidly
      for (let i = 0; i < 10; i++) {
        mockMessageListener(
          { type: 'FROM_CONTENT', data: `Rapid message ${i}` },
          { tab: { id: 123 } }
        );
      }

      await waitFor(() => {
        expect(screen.getByText('Rapid message 0')).toBeDefined();
        expect(screen.getByText('Rapid message 9')).toBeDefined();
      });
    });
  });
});
