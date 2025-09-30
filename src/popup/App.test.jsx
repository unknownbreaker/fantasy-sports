import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import App from './App';

// Mock the webextension-polyfill
vi.mock('webextension-polyfill', () => ({
  default: {
    tabs: {
      query: vi.fn().mockResolvedValue([{ id: 1 }]),
      sendMessage: vi.fn().mockResolvedValue({
        url: 'https://example.com',
        title: 'Example Domain',
        elementCount: 42,
      }),
    },
    runtime: {
      onMessage: {
        addListener: vi.fn(),
        removeListener: vi.fn(),
      },
    },
  },
}));

describe('App Component', () => {
  let queryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
  });

  it('renders the app header', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    );

    expect(screen.getByText(/My Firefox Addon/i)).toBeDefined();
  });

  it('renders all sections', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    );

    // Use getAllByText since "Send to Page" appears in both h2 and button
    expect(screen.getAllByText('Send to Page').length).toBeGreaterThan(0);
    expect(screen.getByText('Messages from Page')).toBeDefined();
    expect(screen.getByText('Page Information')).toBeDefined();
  });

  it('displays page info when loaded', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('https://example.com')).toBeDefined();
      expect(screen.getByText('Example Domain')).toBeDefined();
    });
  });
});
