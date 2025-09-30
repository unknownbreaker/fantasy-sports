import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import MessageForm from './MessageForm';

describe('MessageForm Component', () => {
  it('renders input and button', () => {
    render(<MessageForm onSend={vi.fn()} isLoading={false} />);

    expect(screen.getByPlaceholderText('Enter message')).toBeDefined();
    expect(screen.getByText('Send to Page')).toBeDefined();
  });

  it('calls onSend with message when form is submitted', () => {
    const mockOnSend = vi.fn();
    render(<MessageForm onSend={mockOnSend} isLoading={false} />);

    const input = screen.getByPlaceholderText('Enter message');
    const button = screen.getByText('Send to Page');

    fireEvent.change(input, { target: { value: 'Test message' } });
    fireEvent.click(button);

    expect(mockOnSend).toHaveBeenCalledWith('Test message');
  });

  it('clears input after submission', () => {
    const mockOnSend = vi.fn();
    render(<MessageForm onSend={mockOnSend} isLoading={false} />);

    const input = screen.getByPlaceholderText('Enter message');
    const button = screen.getByText('Send to Page');

    fireEvent.change(input, { target: { value: 'Test message' } });
    fireEvent.click(button);

    expect(input.value).toBe('');
  });

  it('disables button when loading', () => {
    render(<MessageForm onSend={vi.fn()} isLoading={true} />);

    const button = screen.getByText('Sending...');
    expect(button.disabled).toBe(true);
  });

  it('does not submit empty messages', () => {
    const mockOnSend = vi.fn();
    render(<MessageForm onSend={mockOnSend} isLoading={false} />);

    const button = screen.getByText('Send to Page');
    fireEvent.click(button);

    expect(mockOnSend).not.toHaveBeenCalled();
  });
});
