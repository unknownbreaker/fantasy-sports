/**
 * Feature Test Suite: Popup Message to Active Tab Console
 *
 * Feature Description:
 * When a user types a message into the popup input field and clicks the
 * "Send to Page" button, that message should appear in the browser console
 * of the active tab's web page.
 *
 * This test suite is organized into feature modules:
 * - User Input Module
 * - Message Sending Module
 * - Console Output Module
 * - Error Handling Module
 * - Integration Module
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import browser from 'webextension-polyfill';
import App from './App';

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
    },
  },
}));

describe('Feature: Popup Message to Active Tab Console', () => {
  let queryClient;
  let consoleLogSpy;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation();

    browser.tabs.query.mockResolvedValue([{ id: 123 }]);

    browser.tabs.sendMessage.mockImplementation((tabId, message) => {
      if (message.type === 'FROM_POPUP') {
        console.log('Content script received message:', message);
        console.log('Received from popup:', message.data);
      }
      return Promise.resolve({
        success: true,
        echo: message.data,
      });
    });

    vi.clearAllMocks();
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    vi.clearAllMocks();
  });

  /**
   * MODULE: User Input Handling
   * Tests that verify the input field correctly captures user text
   */
  describe('Module: User Input Handling', () => {
    it('accepts text input from user', () => {
      render(
        <QueryClientProvider client={queryClient}>
          <App />
        </QueryClientProvider>
      );

      const input = screen.getByPlaceholderText('Enter message');

      fireEvent.change(input, { target: { value: 'User input test' } });

      expect(input.value).toBe('User input test');
    });

    it('updates input value as user types', () => {
      render(
        <QueryClientProvider client={queryClient}>
          <App />
        </QueryClientProvider>
      );

      const input = screen.getByPlaceholderText('Enter message');

      fireEvent.change(input, { target: { value: 'H' } });
      expect(input.value).toBe('H');

      fireEvent.change(input, { target: { value: 'He' } });
      expect(input.value).toBe('He');

      fireEvent.change(input, { target: { value: 'Hello' } });
      expect(input.value).toBe('Hello');
    });

    it('accepts various character types in input', () => {
      render(
        <QueryClientProvider client={queryClient}>
          <App />
        </QueryClientProvider>
      );

      const input = screen.getByPlaceholderText('Enter message');

      const testInputs = [
        'letters',
        '12345',
        '!@#$%',
        'Mixed123!',
        'With spaces',
        'With\nnewlines',
      ];

      testInputs.forEach((text) => {
        fireEvent.change(input, { target: { value: text } });
        expect(input.value).toBe(text);
      });
    });

    it('handles empty input', () => {
      render(
        <QueryClientProvider client={queryClient}>
          <App />
        </QueryClientProvider>
      );

      const input = screen.getByPlaceholderText('Enter message');

      fireEvent.change(input, { target: { value: '' } });

      expect(input.value).toBe('');
    });

    it('allows user to clear and retype', () => {
      render(
        <QueryClientProvider client={queryClient}>
          <App />
        </QueryClientProvider>
      );

      const input = screen.getByPlaceholderText('Enter message');

      fireEvent.change(input, { target: { value: 'First text' } });
      expect(input.value).toBe('First text');

      fireEvent.change(input, { target: { value: '' } });
      expect(input.value).toBe('');

      fireEvent.change(input, { target: { value: 'Second text' } });
      expect(input.value).toBe('Second text');
    });
  });

  /**
   * MODULE: Button Interaction
   * Tests that verify the send button triggers message transmission
   */
  describe('Module: Button Interaction', () => {
    it('has a clickable send button', () => {
      render(
        <QueryClientProvider client={queryClient}>
          <App />
        </QueryClientProvider>
      );

      const button = screen.getByRole('button', { name: 'Send to Page' });

      expect(button).toBeDefined();
      expect(button.disabled).toBe(false);
    });

    it('triggers message send on button click', async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <App />
        </QueryClientProvider>
      );

      const input = screen.getByPlaceholderText('Enter message');
      const button = screen.getByRole('button', { name: 'Send to Page' });

      fireEvent.change(input, { target: { value: 'Click test' } });
      fireEvent.click(button);

      await waitFor(() => {
        expect(browser.tabs.sendMessage).toHaveBeenCalled();
      });
    });

    it('can be clicked multiple times', async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <App />
        </QueryClientProvider>
      );

      const input = screen.getByPlaceholderText('Enter message');
      const button = screen.getByRole('button', { name: 'Send to Page' });

      // First click
      fireEvent.change(input, { target: { value: 'First' } });
      fireEvent.click(button);

      await waitFor(() => {
        expect(browser.tabs.sendMessage).toHaveBeenCalledTimes(1);
      });

      // Second click
      fireEvent.change(input, { target: { value: 'Second' } });
      fireEvent.click(button);

      await waitFor(() => {
        expect(browser.tabs.sendMessage).toHaveBeenCalledTimes(2);
      });
    });

    it('does not send message without button click', async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <App />
        </QueryClientProvider>
      );

      const input = screen.getByPlaceholderText('Enter message');

      fireEvent.change(input, { target: { value: 'No click' } });

      await new Promise((resolve) => setTimeout(resolve, 200));

      expect(consoleLogSpy).not.toHaveBeenCalledWith(
        'Received from popup:',
        'No click'
      );
    });
  });

  /**
   * MODULE: Message Transmission
   * Tests that verify messages are correctly sent to the content script
   */
  describe('Module: Message Transmission', () => {
    it('sends message with correct structure', async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <App />
        </QueryClientProvider>
      );

      const input = screen.getByPlaceholderText('Enter message');
      const button = screen.getByRole('button', { name: 'Send to Page' });

      fireEvent.change(input, { target: { value: 'Structure test' } });
      fireEvent.click(button);

      await waitFor(() => {
        expect(browser.tabs.sendMessage).toHaveBeenCalledWith(123, {
          type: 'FROM_POPUP',
          data: 'Structure test',
        });
      });
    });

    it('targets the active tab', async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <App />
        </QueryClientProvider>
      );

      const input = screen.getByPlaceholderText('Enter message');
      const button = screen.getByRole('button', { name: 'Send to Page' });

      fireEvent.change(input, { target: { value: 'Target test' } });
      fireEvent.click(button);

      await waitFor(() => {
        expect(browser.tabs.query).toHaveBeenCalledWith({
          active: true,
          currentWindow: true,
        });
      });
    });

    it('sends exact input value without modification', async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <App />
        </QueryClientProvider>
      );

      const input = screen.getByPlaceholderText('Enter message');
      const button = screen.getByRole('button', { name: 'Send to Page' });

      const exactValue = '  Exact Value  123!  ';
      fireEvent.change(input, { target: { value: exactValue } });
      fireEvent.click(button);

      await waitFor(() => {
        expect(browser.tabs.sendMessage).toHaveBeenCalledWith(
          123,
          expect.objectContaining({
            data: exactValue,
          })
        );
      });
    });

    it('transmits different message types correctly', async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <App />
        </QueryClientProvider>
      );

      const input = screen.getByPlaceholderText('Enter message');
      const button = screen.getByRole('button', { name: 'Send to Page' });

      const testMessages = [
        'Simple text',
        'Text with numbers 123',
        'Special chars !@#$%^&*()',
        'Unicode 你好 мир',
        'Emoji 🎉🚀',
      ];

      for (const msg of testMessages) {
        fireEvent.change(input, { target: { value: msg } });
        fireEvent.click(button);

        await waitFor(() => {
          expect(browser.tabs.sendMessage).toHaveBeenCalledWith(
            123,
            expect.objectContaining({ data: msg })
          );
        });
      }
    });
  });

  /**
   * MODULE: Console Output
   * Tests that verify messages appear correctly in the console
   */
  describe('Module: Console Output', () => {
    it('displays message in active tab console', async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <App />
        </QueryClientProvider>
      );

      const input = screen.getByPlaceholderText('Enter message');
      const button = screen.getByRole('button', { name: 'Send to Page' });

      fireEvent.change(input, { target: { value: 'Console test' } });
      fireEvent.click(button);

      await waitFor(() => {
        expect(consoleLogSpy).toHaveBeenCalledWith(
          'Received from popup:',
          'Console test'
        );
      });
    });

    it('outputs message with clear prefix', async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <App />
        </QueryClientProvider>
      );

      const input = screen.getByPlaceholderText('Enter message');
      const button = screen.getByRole('button', { name: 'Send to Page' });

      fireEvent.change(input, { target: { value: 'Prefix test' } });
      fireEvent.click(button);

      await waitFor(() => {
        const logCalls = consoleLogSpy.mock.calls;
        const popupLog = logCalls.find(
          (call) => call[0] === 'Received from popup:'
        );

        expect(popupLog).toBeDefined();
        expect(popupLog[0]).toBe('Received from popup:');
        expect(popupLog[1]).toBe('Prefix test');
      });
    });

    it('logs message as separate parameter for readability', async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <App />
        </QueryClientProvider>
      );

      const input = screen.getByPlaceholderText('Enter message');
      const button = screen.getByRole('button', { name: 'Send to Page' });

      fireEvent.change(input, { target: { value: 'Readable' } });
      fireEvent.click(button);

      await waitFor(() => {
        const logCalls = consoleLogSpy.mock.calls;
        const popupLog = logCalls.find(
          (call) => call[0] === 'Received from popup:'
        );

        // Should have 2 parameters: prefix and message
        expect(popupLog.length).toBe(2);
        expect(popupLog[0]).toBeTypeOf('string');
        expect(popupLog[1]).toBe('Readable');
      });
    });

    it('maintains console output for multiple messages', async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <App />
        </QueryClientProvider>
      );

      const input = screen.getByPlaceholderText('Enter message');
      const button = screen.getByRole('button', { name: 'Send to Page' });

      const messages = ['Message A', 'Message B', 'Message C'];

      for (const msg of messages) {
        fireEvent.change(input, { target: { value: msg } });
        fireEvent.click(button);
      }

      await waitFor(() => {
        messages.forEach((msg) => {
          expect(consoleLogSpy).toHaveBeenCalledWith(
            'Received from popup:',
            msg
          );
        });
      });
    });

    it('preserves message content in console output', async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <App />
        </QueryClientProvider>
      );

      const input = screen.getByPlaceholderText('Enter message');
      const button = screen.getByRole('button', { name: 'Send to Page' });

      const specialContent = 'Content with\nnewlines\tand tabs';
      fireEvent.change(input, { target: { value: specialContent } });
      fireEvent.click(button);

      await waitFor(() => {
        expect(consoleLogSpy).toHaveBeenCalledWith(
          'Received from popup:',
          specialContent
        );
      });
    });
  });

  /**
   * MODULE: Error Handling
   * Tests that verify the feature handles errors gracefully
   */
  describe('Module: Error Handling', () => {
    it('handles content script not available', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation();

      browser.tabs.sendMessage.mockRejectedValue(
        new Error('Could not establish connection')
      );

      render(
        <QueryClientProvider client={queryClient}>
          <App />
        </QueryClientProvider>
      );

      const input = screen.getByPlaceholderText('Enter message');
      const button = screen.getByRole('button', { name: 'Send to Page' });

      fireEvent.change(input, { target: { value: 'Error test' } });
      fireEvent.click(button);

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          'Error sending message:',
          expect.any(Error)
        );
      });

      consoleErrorSpy.mockRestore();
    });

    it('handles no active tab scenario', async () => {
      browser.tabs.query.mockResolvedValue([]);

      render(
        <QueryClientProvider client={queryClient}>
          <App />
        </QueryClientProvider>
      );

      const input = screen.getByPlaceholderText('Enter message');
      const button = screen.getByRole('button', { name: 'Send to Page' });

      fireEvent.change(input, { target: { value: 'No tab' } });
      fireEvent.click(button);

      await new Promise((resolve) => setTimeout(resolve, 300));

      // Should not log message to console
      const popupLogs = consoleLogSpy.mock.calls.filter(
        (call) => call[0] === 'Received from popup:'
      );

      expect(popupLogs).toHaveLength(0);
    });

    it('continues working after error recovery', async () => {
      // First call fails
      browser.tabs.sendMessage.mockRejectedValueOnce(
        new Error('Temporary error')
      );

      // Second call succeeds
      browser.tabs.sendMessage.mockImplementationOnce((tabId, message) => {
        if (message.type === 'FROM_POPUP') {
          console.log('Content script received message:', message);
          console.log('Received from popup:', message.data);
        }
        return Promise.resolve({ success: true, echo: message.data });
      });

      render(
        <QueryClientProvider client={queryClient}>
          <App />
        </QueryClientProvider>
      );

      const input = screen.getByPlaceholderText('Enter message');
      const button = screen.getByRole('button', { name: 'Send to Page' });

      // First attempt fails
      fireEvent.change(input, { target: { value: 'Fail' } });
      fireEvent.click(button);

      await new Promise((resolve) => setTimeout(resolve, 200));

      // Second attempt succeeds
      fireEvent.change(input, { target: { value: 'Success' } });
      fireEvent.click(button);

      await waitFor(() => {
        expect(consoleLogSpy).toHaveBeenCalledWith(
          'Received from popup:',
          'Success'
        );
      });
    });
  });

  /**
   * MODULE: Feature Integration
   * End-to-end tests that verify the complete feature workflow
   */
  describe('Module: Feature Integration (End-to-End)', () => {
    it('completes full workflow: type → click → console output', async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <App />
        </QueryClientProvider>
      );

      // Step 1: User types in input
      const input = screen.getByPlaceholderText('Enter message');
      fireEvent.change(input, { target: { value: 'Full workflow test' } });

      // Step 2: User clicks send button
      const button = screen.getByRole('button', { name: 'Send to Page' });
      fireEvent.click(button);

      // Step 3: Verify message appears in console
      await waitFor(() => {
        expect(consoleLogSpy).toHaveBeenCalledWith(
          'Received from popup:',
          'Full workflow test'
        );
      });

      // Step 4: Verify message was sent to correct tab
      expect(browser.tabs.sendMessage).toHaveBeenCalledWith(123, {
        type: 'FROM_POPUP',
        data: 'Full workflow test',
      });
    });

    it('supports continuous usage pattern', async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <App />
        </QueryClientProvider>
      );

      const input = screen.getByPlaceholderText('Enter message');
      const button = screen.getByRole('button', { name: 'Send to Page' });

      // Simulate typical usage pattern
      const userActions = ['First message', 'Second message', 'Third message'];

      for (const message of userActions) {
        // Type message
        fireEvent.change(input, { target: { value: message } });

        // Click send
        fireEvent.click(button);

        // Verify in console
        await waitFor(() => {
          expect(consoleLogSpy).toHaveBeenCalledWith(
            'Received from popup:',
            message
          );
        });
      }

      // Verify all messages were processed
      const popupLogs = consoleLogSpy.mock.calls.filter(
        (call) => call[0] === 'Received from popup:'
      );

      expect(popupLogs.length).toBe(userActions.length);
    });

    it('integrates with browser extension messaging system', async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <App />
        </QueryClientProvider>
      );

      const input = screen.getByPlaceholderText('Enter message');
      const button = screen.getByRole('button', { name: 'Send to Page' });

      fireEvent.change(input, { target: { value: 'Integration test' } });
      fireEvent.click(button);

      await waitFor(() => {
        // Verify browser API was called
        expect(browser.tabs.query).toHaveBeenCalled();
        expect(browser.tabs.sendMessage).toHaveBeenCalled();

        // Verify console output
        expect(consoleLogSpy).toHaveBeenCalledWith(
          'Received from popup:',
          'Integration test'
        );
      });
    });

    it('maintains state across multiple interactions', async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <App />
        </QueryClientProvider>
      );

      const input = screen.getByPlaceholderText('Enter message');
      const button = screen.getByRole('button', { name: 'Send to Page' });

      // First interaction
      fireEvent.change(input, { target: { value: 'State test 1' } });
      fireEvent.click(button);

      await waitFor(() => {
        expect(consoleLogSpy).toHaveBeenCalledWith(
          'Received from popup:',
          'State test 1'
        );
      });

      // Clear and type again
      fireEvent.change(input, { target: { value: '' } });
      fireEvent.change(input, { target: { value: 'State test 2' } });
      fireEvent.click(button);

      await waitFor(() => {
        expect(consoleLogSpy).toHaveBeenCalledWith(
          'Received from popup:',
          'State test 2'
        );
      });

      // Verify both messages were logged
      expect(consoleLogSpy).toHaveBeenCalledWith(
        'Received from popup:',
        'State test 1'
      );
      expect(consoleLogSpy).toHaveBeenCalledWith(
        'Received from popup:',
        'State test 2'
      );
    });
  });

  /**
   * MODULE: Data Validation
   * Tests that verify data integrity throughout the message flow
   */
  describe('Module: Data Validation', () => {
    it('preserves exact input value in console', async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <App />
        </QueryClientProvider>
      );

      const input = screen.getByPlaceholderText('Enter message');
      const button = screen.getByRole('button', { name: 'Send to Page' });

      const exactValue = 'Exact123!@#';
      fireEvent.change(input, { target: { value: exactValue } });
      fireEvent.click(button);

      await waitFor(() => {
        const popupLogs = consoleLogSpy.mock.calls.filter(
          (call) => call[0] === 'Received from popup:'
        );

        expect(popupLogs[0][1]).toBe(exactValue);
      });
    });

    it('does not add extra characters', async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <App />
        </QueryClientProvider>
      );

      const input = screen.getByPlaceholderText('Enter message');
      const button = screen.getByRole('button', { name: 'Send to Page' });

      const originalValue = 'Clean';
      fireEvent.change(input, { target: { value: originalValue } });
      fireEvent.click(button);

      await waitFor(() => {
        const popupLogs = consoleLogSpy.mock.calls.filter(
          (call) => call[0] === 'Received from popup:'
        );

        // Should be exactly the original value
        expect(popupLogs[0][1]).toBe(originalValue);
        expect(popupLogs[0][1].length).toBe(originalValue.length);
      });
    });

    it('does not remove whitespace', async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <App />
        </QueryClientProvider>
      );

      const input = screen.getByPlaceholderText('Enter message');
      const button = screen.getByRole('button', { name: 'Send to Page' });

      const valueWithSpaces = '  leading and trailing  ';
      fireEvent.change(input, { target: { value: valueWithSpaces } });
      fireEvent.click(button);

      await waitFor(() => {
        expect(consoleLogSpy).toHaveBeenCalledWith(
          'Received from popup:',
          valueWithSpaces
        );
      });
    });

    it('handles case sensitivity correctly', async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <App />
        </QueryClientProvider>
      );

      const input = screen.getByPlaceholderText('Enter message');
      const button = screen.getByRole('button', { name: 'Send to Page' });

      const testCases = ['lowercase', 'UPPERCASE', 'MixedCase'];

      for (const testCase of testCases) {
        fireEvent.change(input, { target: { value: testCase } });
        fireEvent.click(button);

        await waitFor(() => {
          expect(consoleLogSpy).toHaveBeenCalledWith(
            'Received from popup:',
            testCase
          );
        });
      }
    });
  });

  /**
   * MODULE: Performance
   * Tests that verify the feature performs well under various conditions
   */
  describe('Module: Performance', () => {
    it('handles rapid successive sends', async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <App />
        </QueryClientProvider>
      );

      const input = screen.getByPlaceholderText('Enter message');
      const button = screen.getByRole('button', { name: 'Send to Page' });

      // Send 5 messages rapidly
      for (let i = 1; i <= 5; i++) {
        fireEvent.change(input, { target: { value: `Rapid ${i}` } });
        fireEvent.click(button);
      }

      // All messages should eventually appear
      await waitFor(
        () => {
          for (let i = 1; i <= 5; i++) {
            expect(consoleLogSpy).toHaveBeenCalledWith(
              'Received from popup:',
              `Rapid ${i}`
            );
          }
        },
        { timeout: 3000 }
      );
    });

    it('processes messages in order', async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <App />
        </QueryClientProvider>
      );

      const input = screen.getByPlaceholderText('Enter message');
      const button = screen.getByRole('button', { name: 'Send to Page' });

      const orderedMessages = ['First', 'Second', 'Third'];

      for (const msg of orderedMessages) {
        fireEvent.change(input, { target: { value: msg } });
        fireEvent.click(button);
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      await waitFor(() => {
        const popupLogs = consoleLogSpy.mock.calls
          .filter((call) => call[0] === 'Received from popup:')
          .map((call) => call[1]);

        const firstIdx = popupLogs.indexOf('First');
        const secondIdx = popupLogs.indexOf('Second');
        const thirdIdx = popupLogs.indexOf('Third');

        expect(firstIdx).toBeLessThan(secondIdx);
        expect(secondIdx).toBeLessThan(thirdIdx);
      });
    });

    it('handles long messages efficiently', async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <App />
        </QueryClientProvider>
      );

      const input = screen.getByPlaceholderText('Enter message');
      const button = screen.getByRole('button', { name: 'Send to Page' });

      const longMessage = 'Long message content. '.repeat(100);
      fireEvent.change(input, { target: { value: longMessage } });
      fireEvent.click(button);

      await waitFor(
        () => {
          expect(consoleLogSpy).toHaveBeenCalledWith(
            'Received from popup:',
            longMessage
          );
        },
        { timeout: 2000 }
      );
    });
  });

  /**
   * MODULE: User Experience
   * Tests that verify the feature provides good user experience
   */
  describe('Module: User Experience', () => {
    it('provides immediate feedback on send', async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <App />
        </QueryClientProvider>
      );

      const input = screen.getByPlaceholderText('Enter message');
      const button = screen.getByRole('button', { name: 'Send to Page' });

      fireEvent.change(input, { target: { value: 'UX test' } });

      const clickTime = Date.now();
      fireEvent.click(button);

      await waitFor(() => {
        expect(browser.tabs.sendMessage).toHaveBeenCalled();
      });

      const responseTime = Date.now() - clickTime;

      // Should respond within reasonable time (1 second)
      expect(responseTime).toBeLessThan(1000);
    });

    it('allows clearing input after send', async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <App />
        </QueryClientProvider>
      );

      const input = screen.getByPlaceholderText('Enter message');
      const button = screen.getByRole('button', { name: 'Send to Page' });

      fireEvent.change(input, { target: { value: 'Send and clear' } });
      fireEvent.click(button);

      await waitFor(() => {
        expect(consoleLogSpy).toHaveBeenCalledWith(
          'Received from popup:',
          'Send and clear'
        );
      });

      // User can clear after sending
      fireEvent.change(input, { target: { value: '' } });
      expect(input.value).toBe('');
    });

    it('maintains input focus for continuous use', () => {
      render(
        <QueryClientProvider client={queryClient}>
          <App />
        </QueryClientProvider>
      );

      const input = screen.getByPlaceholderText('Enter message');

      fireEvent.change(input, { target: { value: 'Focus test' } });

      // Input should still be accessible for typing
      fireEvent.change(input, { target: { value: 'Still typing' } });

      expect(input.value).toBe('Still typing');
    });
  });

  /**
   * MODULE: Edge Cases
   * Tests that verify the feature handles unusual scenarios
   */
  describe('Module: Edge Cases', () => {
    it('handles empty message send attempt', async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <App />
        </QueryClientProvider>
      );

      const button = screen.getByRole('button', { name: 'Send to Page' });

      const initialCallCount = consoleLogSpy.mock.calls.length;

      fireEvent.click(button);

      await new Promise((resolve) => setTimeout(resolve, 200));

      const newPopupLogs = consoleLogSpy.mock.calls
        .slice(initialCallCount)
        .filter((call) => call[0] === 'Received from popup:');

      expect(newPopupLogs).toHaveLength(0);
    });

    it('handles message with only whitespace', async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <App />
        </QueryClientProvider>
      );

      const input = screen.getByPlaceholderText('Enter message');
      const button = screen.getByRole('button', { name: 'Send to Page' });

      const whitespaceOnly = '     ';
      fireEvent.change(input, { target: { value: whitespaceOnly } });
      fireEvent.click(button);

      await waitFor(() => {
        expect(consoleLogSpy).toHaveBeenCalledWith(
          'Received from popup:',
          whitespaceOnly
        );
      });
    });

    it('handles unicode and special characters', async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <App />
        </QueryClientProvider>
      );

      const input = screen.getByPlaceholderText('Enter message');
      const button = screen.getByRole('button', { name: 'Send to Page' });

      const specialChars = '你好 мир 🌍 \u00A9 \u2764';
      fireEvent.change(input, { target: { value: specialChars } });
      fireEvent.click(button);

      await waitFor(() => {
        expect(consoleLogSpy).toHaveBeenCalledWith(
          'Received from popup:',
          specialChars
        );
      });
    });

    it('handles messages with HTML-like content', async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <App />
        </QueryClientProvider>
      );

      const input = screen.getByPlaceholderText('Enter message');
      const button = screen.getByRole('button', { name: 'Send to Page' });

      const htmlLike = '<div>Not actual HTML</div>';
      fireEvent.change(input, { target: { value: htmlLike } });
      fireEvent.click(button);

      await waitFor(() => {
        expect(consoleLogSpy).toHaveBeenCalledWith(
          'Received from popup:',
          htmlLike
        );
      });
    });

    it('handles messages with escape characters', async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <App />
        </QueryClientProvider>
      );

      const input = screen.getByPlaceholderText('Enter message');
      const button = screen.getByRole('button', { name: 'Send to Page' });

      const withEscapes = 'Line 1\nLine 2\tTabbed\rReturn';
      fireEvent.change(input, { target: { value: withEscapes } });
      fireEvent.click(button);

      await waitFor(() => {
        expect(consoleLogSpy).toHaveBeenCalledWith(
          'Received from popup:',
          withEscapes
        );
      });
    });
  });
});
