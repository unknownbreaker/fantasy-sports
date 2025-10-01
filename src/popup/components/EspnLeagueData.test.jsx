// src/popup/components/EspnLeagueData.test.jsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import browser from 'webextension-polyfill';
import { ESPN_MESSAGE_TYPES } from '../../services/espnApi/espnMessageHandler';
import EspnLeagueData from './EspnLeagueData';

// Mock browser API
vi.mock('webextension-polyfill', () => ({
  default: {
    runtime: {
      sendMessage: vi.fn(),
    },
  },
}));

// Helper to render with QueryClient
function renderWithQueryClient(component) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>{component}</QueryClientProvider>
  );
}

describe('EspnLeagueData Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Initial Render', () => {
    it('should render with default league ID', () => {
      renderWithQueryClient(<EspnLeagueData />);

      expect(screen.getByLabelText(/league id/i)).toHaveValue('59986587');
      expect(
        screen.getByRole('button', { name: /fetch league data/i })
      ).toBeDefined();
    });

    it('should render form elements', () => {
      renderWithQueryClient(<EspnLeagueData />);

      expect(screen.getByRole('textbox')).toBeDefined();
      expect(screen.getByRole('button')).toBeDefined();
      expect(screen.getByText(/espn league data fetcher/i)).toBeDefined();
    });
  });

  describe('User Interactions', () => {
    it('should update input value when user types', async () => {
      const user = userEvent.setup();
      renderWithQueryClient(<EspnLeagueData />);

      const input = screen.getByLabelText(/league id/i);

      await user.clear(input);
      await user.type(input, '12345678');

      expect(input).toHaveValue('12345678');
    });

    it('should disable button when input is empty', async () => {
      const user = userEvent.setup();
      renderWithQueryClient(<EspnLeagueData />);

      const input = screen.getByLabelText(/league id/i);
      const button = screen.getByRole('button');

      await user.clear(input);

      expect(button).toBeDisabled();
    });

    it('should enable button when input has value', () => {
      renderWithQueryClient(<EspnLeagueData />);

      const button = screen.getByRole('button');

      expect(button).not.toBeDisabled();
    });
  });

  describe('Fetching Data', () => {
    it('should send message when form is submitted', async () => {
      const user = userEvent.setup();
      const mockResponse = {
        type: ESPN_MESSAGE_TYPES.LEAGUE_DATA_SUCCESS,
        data: { id: '59986587', name: 'Test League' },
      };

      browser.runtime.sendMessage.mockResolvedValue(mockResponse);

      renderWithQueryClient(<EspnLeagueData />);

      const button = screen.getByRole('button');
      await user.click(button);

      expect(browser.runtime.sendMessage).toHaveBeenCalledWith({
        type: ESPN_MESSAGE_TYPES.FETCH_LEAGUE_DATA,
        leagueId: '59986587',
      });
    });

    it('should display loading state during fetch', async () => {
      const user = userEvent.setup();

      browser.runtime.sendMessage.mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );

      renderWithQueryClient(<EspnLeagueData />);

      const button = screen.getByRole('button');
      await user.click(button);

      expect(screen.getByText(/fetching\.\.\./i)).toBeDefined();
      expect(button).toBeDisabled();
    });

    it('should display league data on successful fetch', async () => {
      const user = userEvent.setup();
      const mockLeagueData = {
        id: '59986587',
        name: 'Test League',
        seasonId: 2025,
      };

      const mockResponse = {
        type: ESPN_MESSAGE_TYPES.LEAGUE_DATA_SUCCESS,
        data: mockLeagueData,
      };

      browser.runtime.sendMessage.mockResolvedValue(mockResponse);

      renderWithQueryClient(<EspnLeagueData />);

      const button = screen.getByRole('button');
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByText(/league information/i)).toBeDefined();
      });

      expect(screen.getByText(/"id": "59986587"/)).toBeDefined();
      expect(screen.getByText(/"name": "Test League"/)).toBeDefined();
    });

    it('should display error message on failed fetch', async () => {
      const user = userEvent.setup();
      const mockResponse = {
        type: ESPN_MESSAGE_TYPES.LEAGUE_DATA_ERROR,
        error: 'Network error',
      };

      browser.runtime.sendMessage.mockResolvedValue(mockResponse);

      renderWithQueryClient(<EspnLeagueData />);

      const button = screen.getByRole('button');
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByText(/error:/i)).toBeDefined();
      });

      expect(screen.getByText(/network error/i)).toBeDefined();
    });

    it('should allow refetching after error', async () => {
      const user = userEvent.setup();

      // First call fails
      browser.runtime.sendMessage.mockResolvedValueOnce({
        type: ESPN_MESSAGE_TYPES.LEAGUE_DATA_ERROR,
        error: 'Network error',
      });

      renderWithQueryClient(<EspnLeagueData />);

      const button = screen.getByRole('button');
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByText(/network error/i)).toBeDefined();
      });

      // Second call succeeds
      browser.runtime.sendMessage.mockResolvedValueOnce({
        type: ESPN_MESSAGE_TYPES.LEAGUE_DATA_SUCCESS,
        data: { id: '59986587', name: 'Test League' },
      });

      await user.click(button);

      await waitFor(() => {
        expect(screen.getByText(/league information/i)).toBeDefined();
      });
    });
  });

  describe('League ID Validation', () => {
    it('should handle whitespace in league ID', async () => {
      const user = userEvent.setup();
      renderWithQueryClient(<EspnLeagueData />);

      const input = screen.getByLabelText(/league id/i);
      const button = screen.getByRole('button');

      await user.clear(input);
      await user.type(input, '   ');

      expect(button).toBeDisabled();
    });

    it('should fetch with custom league ID', async () => {
      const user = userEvent.setup();
      const customLeagueId = '87654321';

      browser.runtime.sendMessage.mockResolvedValue({
        type: ESPN_MESSAGE_TYPES.LEAGUE_DATA_SUCCESS,
        data: { id: customLeagueId },
      });

      renderWithQueryClient(<EspnLeagueData />);

      const input = screen.getByLabelText(/league id/i);
      await user.clear(input);
      await user.type(input, customLeagueId);

      const button = screen.getByRole('button');
      await user.click(button);

      expect(browser.runtime.sendMessage).toHaveBeenCalledWith({
        type: ESPN_MESSAGE_TYPES.FETCH_LEAGUE_DATA,
        leagueId: customLeagueId,
      });
    });
  });
});
