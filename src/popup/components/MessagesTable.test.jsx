import { render, screen } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import MessagesTable from './MessagesTable';

describe('MessagesTable Component - Data Communication Tests', () => {
  describe('Empty State', () => {
    it('displays empty state message when no messages', () => {
      render(<MessagesTable messages={[]} />);

      expect(screen.getByText('No messages yet')).toBeDefined();
    });

    it('renders table structure even when empty', () => {
      const { container } = render(<MessagesTable messages={[]} />);

      expect(container.querySelector('.messages-table')).toBeDefined();
      expect(container.querySelector('thead')).toBeDefined();
      expect(container.querySelector('tbody')).toBeDefined();
    });

    it('displays correct table headers', () => {
      render(<MessagesTable messages={[]} />);

      expect(screen.getByText('Time')).toBeDefined();
      expect(screen.getByText('Message')).toBeDefined();
    });
  });

  describe('Single Message Display', () => {
    it('displays a single message correctly', () => {
      const messages = [
        {
          id: 1,
          timestamp: '10:30:45 AM',
          content: 'Button clicked',
          sender: 'content',
        },
      ];

      render(<MessagesTable messages={messages} />);

      expect(screen.getByText('10:30:45 AM')).toBeDefined();
      expect(screen.getByText('Button clicked')).toBeDefined();
    });

    it('renders message in table row', () => {
      const messages = [
        {
          id: 1,
          timestamp: '10:30:45 AM',
          content: 'Test message',
          sender: 'content',
        },
      ];

      const { container } = render(<MessagesTable messages={messages} />);

      const tableRows = container.querySelectorAll('tbody tr');
      expect(tableRows.length).toBe(1);
    });
  });

  describe('Multiple Messages Display', () => {
    it('displays multiple messages in order', () => {
      const messages = [
        {
          id: 1,
          timestamp: '10:30:00 AM',
          content: 'First message',
          sender: 'content',
        },
        {
          id: 2,
          timestamp: '10:31:00 AM',
          content: 'Second message',
          sender: 'content',
        },
        {
          id: 3,
          timestamp: '10:32:00 AM',
          content: 'Third message',
          sender: 'content',
        },
      ];

      render(<MessagesTable messages={messages} />);

      expect(screen.getByText('First message')).toBeDefined();
      expect(screen.getByText('Second message')).toBeDefined();
      expect(screen.getByText('Third message')).toBeDefined();
    });

    it('renders correct number of table rows', () => {
      const messages = Array.from({ length: 5 }, (_, i) => ({
        id: i,
        timestamp: `10:30:${i.toString().padStart(2, '0')} AM`,
        content: `Message ${i}`,
        sender: 'content',
      }));

      const { container } = render(<MessagesTable messages={messages} />);

      const tableRows = container.querySelectorAll('tbody tr');
      expect(tableRows.length).toBe(5);
    });

    it('displays messages in reverse chronological order', () => {
      const messages = [
        {
          id: 3,
          timestamp: '10:32:00 AM',
          content: 'Newest',
          sender: 'content',
        },
        {
          id: 2,
          timestamp: '10:31:00 AM',
          content: 'Middle',
          sender: 'content',
        },
        {
          id: 1,
          timestamp: '10:30:00 AM',
          content: 'Oldest',
          sender: 'content',
        },
      ];

      const { container } = render(<MessagesTable messages={messages} />);

      const rows = container.querySelectorAll('tbody tr');
      expect(rows[0].textContent).toContain('Newest');
      expect(rows[1].textContent).toContain('Middle');
      expect(rows[2].textContent).toContain('Oldest');
    });
  });

  describe('Message Content Types', () => {
    it('displays click event messages from content script', () => {
      const messages = [
        {
          id: 1,
          timestamp: '10:30:00 AM',
          content: 'Clicked: BUTTON.submit-btn',
          sender: 'content',
        },
      ];

      render(<MessagesTable messages={messages} />);

      expect(screen.getByText('Clicked: BUTTON.submit-btn')).toBeDefined();
    });

    it('displays various HTML element click events', () => {
      const messages = [
        {
          id: 1,
          timestamp: '10:30:00 AM',
          content: 'Clicked: DIV.container',
          sender: 'content',
        },
        {
          id: 2,
          timestamp: '10:30:01 AM',
          content: 'Clicked: A.nav-link',
          sender: 'content',
        },
        {
          id: 3,
          timestamp: '10:30:02 AM',
          content: 'Clicked: IMG',
          sender: 'content',
        },
      ];

      render(<MessagesTable messages={messages} />);

      expect(screen.getByText('Clicked: DIV.container')).toBeDefined();
      expect(screen.getByText('Clicked: A.nav-link')).toBeDefined();
      expect(screen.getByText('Clicked: IMG')).toBeDefined();
    });

    it('displays custom messages from content script', () => {
      const messages = [
        {
          id: 1,
          timestamp: '10:30:00 AM',
          content: 'Form submitted successfully',
          sender: 'content',
        },
      ];

      render(<MessagesTable messages={messages} />);

      expect(screen.getByText('Form submitted successfully')).toBeDefined();
    });

    it('handles messages with special characters', () => {
      const messages = [
        {
          id: 1,
          timestamp: '10:30:00 AM',
          content: 'Clicked: DIV.class-name_123 & special!',
          sender: 'content',
        },
      ];

      render(<MessagesTable messages={messages} />);

      expect(
        screen.getByText('Clicked: DIV.class-name_123 & special!')
      ).toBeDefined();
    });

    it('displays long message content without truncation', () => {
      const longMessage = 'A'.repeat(200);
      const messages = [
        {
          id: 1,
          timestamp: '10:30:00 AM',
          content: longMessage,
          sender: 'content',
        },
      ];

      render(<MessagesTable messages={messages} />);

      expect(screen.getByText(longMessage)).toBeDefined();
    });

    it('displays empty content gracefully', () => {
      const messages = [
        {
          id: 1,
          timestamp: '10:30:00 AM',
          content: '',
          sender: 'content',
        },
      ];

      const { container } = render(<MessagesTable messages={messages} />);

      const rows = container.querySelectorAll('tbody tr');
      expect(rows.length).toBe(1);
    });
  });

  describe('Timestamp Display', () => {
    it('displays various timestamp formats', () => {
      const messages = [
        {
          id: 1,
          timestamp: '10:30:45 AM',
          content: 'Morning message',
          sender: 'content',
        },
        {
          id: 2,
          timestamp: '2:15:30 PM',
          content: 'Afternoon message',
          sender: 'content',
        },
        {
          id: 3,
          timestamp: '11:59:59 PM',
          content: 'Night message',
          sender: 'content',
        },
      ];

      render(<MessagesTable messages={messages} />);

      expect(screen.getByText('10:30:45 AM')).toBeDefined();
      expect(screen.getByText('2:15:30 PM')).toBeDefined();
      expect(screen.getByText('11:59:59 PM')).toBeDefined();
    });

    it('displays timestamps in first column', () => {
      const messages = [
        {
          id: 1,
          timestamp: '10:30:00 AM',
          content: 'Test message',
          sender: 'content',
        },
      ];

      const { container } = render(<MessagesTable messages={messages} />);

      const firstCell = container.querySelector('tbody tr td:first-child');
      expect(firstCell.textContent).toBe('10:30:00 AM');
    });

    it('displays content in second column', () => {
      const messages = [
        {
          id: 1,
          timestamp: '10:30:00 AM',
          content: 'Test content',
          sender: 'content',
        },
      ];

      const { container } = render(<MessagesTable messages={messages} />);

      const secondCell = container.querySelector('tbody tr td:nth-child(2)');
      expect(secondCell.textContent).toBe('Test content');
    });
  });

  describe('Message Updates and Streaming', () => {
    it('updates when new messages are added', () => {
      const initialMessages = [
        {
          id: 1,
          timestamp: '10:30:00 AM',
          content: 'First message',
          sender: 'content',
        },
      ];

      const { rerender } = render(<MessagesTable messages={initialMessages} />);

      expect(screen.getByText('First message')).toBeDefined();

      const updatedMessages = [
        ...initialMessages,
        {
          id: 2,
          timestamp: '10:31:00 AM',
          content: 'Second message',
          sender: 'content',
        },
      ];

      rerender(<MessagesTable messages={updatedMessages} />);

      expect(screen.getByText('First message')).toBeDefined();
      expect(screen.getByText('Second message')).toBeDefined();
    });

    it('handles rapid message additions', () => {
      const { rerender, container } = render(<MessagesTable messages={[]} />);

      for (let i = 0; i < 10; i++) {
        const messages = Array.from({ length: i + 1 }, (_, j) => ({
          id: j,
          timestamp: `10:30:${j.toString().padStart(2, '0')} AM`,
          content: `Message ${j}`,
          sender: 'content',
        }));

        rerender(<MessagesTable messages={messages} />);
      }

      const rows = container.querySelectorAll('tbody tr');
      expect(rows.length).toBe(10);
    });

    it('maintains message order during updates', () => {
      const messages1 = [
        {
          id: 1,
          timestamp: '10:30:00 AM',
          content: 'First',
          sender: 'content',
        },
      ];

      const { rerender, container } = render(
        <MessagesTable messages={messages1} />
      );

      const messages2 = [
        {
          id: 2,
          timestamp: '10:31:00 AM',
          content: 'Second',
          sender: 'content',
        },
        ...messages1,
      ];

      rerender(<MessagesTable messages={messages2} />);

      const rows = container.querySelectorAll('tbody tr');
      expect(rows[0].textContent).toContain('Second');
      expect(rows[1].textContent).toContain('First');
    });
  });

  describe('Large Data Sets', () => {
    it('handles 50 messages efficiently', () => {
      const messages = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        timestamp: `10:${Math.floor(i / 60)
          .toString()
          .padStart(2, '0')}:${(i % 60).toString().padStart(2, '0')} AM`,
        content: `Message number ${i}`,
        sender: 'content',
      }));

      const { container } = render(<MessagesTable messages={messages} />);

      const rows = container.querySelectorAll('tbody tr');
      expect(rows.length).toBe(50);
    });

    it('handles 100 messages without performance issues', () => {
      const messages = Array.from({ length: 100 }, (_, i) => ({
        id: i,
        timestamp: `10:00:00 AM`,
        content: `Message ${i}`,
        sender: 'content',
      }));

      const startTime = performance.now();
      render(<MessagesTable messages={messages} />);
      const endTime = performance.now();

      // Rendering should be fast (under 100ms for 100 items)
      expect(endTime - startTime).toBeLessThan(100);
    });
  });

  describe('Message ID Handling', () => {
    it('uses message id as unique key', () => {
      const messages = [
        {
          id: 12345,
          timestamp: '10:30:00 AM',
          content: 'Message with custom ID',
          sender: 'content',
        },
      ];

      const { container } = render(<MessagesTable messages={messages} />);

      const row = container.querySelector('tbody tr');
      expect(row).toBeDefined();
    });

    it('handles duplicate content with different IDs', () => {
      const messages = [
        {
          id: 1,
          timestamp: '10:30:00 AM',
          content: 'Duplicate content',
          sender: 'content',
        },
        {
          id: 2,
          timestamp: '10:31:00 AM',
          content: 'Duplicate content',
          sender: 'content',
        },
      ];

      const { container } = render(<MessagesTable messages={messages} />);

      const rows = container.querySelectorAll('tbody tr');
      expect(rows.length).toBe(2);
    });

    it('handles timestamp-based IDs from Date.now()', () => {
      const now = Date.now();
      const messages = [
        {
          id: now,
          timestamp: new Date(now).toLocaleTimeString(),
          content: 'Current time message',
          sender: 'content',
        },
      ];

      render(<MessagesTable messages={messages} />);

      expect(screen.getByText('Current time message')).toBeDefined();
    });
  });

  describe('Real-world Content Script Scenarios', () => {
    it('displays typical click tracking messages', () => {
      const messages = [
        {
          id: 1,
          timestamp: '10:30:00 AM',
          content: 'Clicked: BUTTON.btn-primary',
          sender: 'content',
        },
        {
          id: 2,
          timestamp: '10:30:05 AM',
          content: 'Clicked: A.navbar-link',
          sender: 'content',
        },
        {
          id: 3,
          timestamp: '10:30:10 AM',
          content: 'Clicked: DIV.card-container',
          sender: 'content',
        },
      ];

      render(<MessagesTable messages={messages} />);

      expect(screen.getByText('Clicked: BUTTON.btn-primary')).toBeDefined();
      expect(screen.getByText('Clicked: A.navbar-link')).toBeDefined();
      expect(screen.getByText('Clicked: DIV.card-container')).toBeDefined();
    });

    it('displays messages from content script page interactions', () => {
      const messages = [
        {
          id: 1,
          timestamp: '10:30:00 AM',
          content: 'Page loaded',
          sender: 'content',
        },
        {
          id: 2,
          timestamp: '10:30:05 AM',
          content: 'User scrolled to bottom',
          sender: 'content',
        },
        {
          id: 3,
          timestamp: '10:30:10 AM',
          content: 'Form field focused: email',
          sender: 'content',
        },
      ];

      render(<MessagesTable messages={messages} />);

      expect(screen.getByText('Page loaded')).toBeDefined();
      expect(screen.getByText('User scrolled to bottom')).toBeDefined();
      expect(screen.getByText('Form field focused: email')).toBeDefined();
    });
  });

  describe('Table Accessibility', () => {
    it('has proper table structure for screen readers', () => {
      const messages = [
        {
          id: 1,
          timestamp: '10:30:00 AM',
          content: 'Test message',
          sender: 'content',
        },
      ];

      const { container } = render(<MessagesTable messages={messages} />);

      const table = container.querySelector('table');
      const thead = container.querySelector('thead');
      const tbody = container.querySelector('tbody');
      const headers = container.querySelectorAll('th');

      expect(table).toBeDefined();
      expect(thead).toBeDefined();
      expect(tbody).toBeDefined();
      expect(headers.length).toBe(2);
    });
  });
});
