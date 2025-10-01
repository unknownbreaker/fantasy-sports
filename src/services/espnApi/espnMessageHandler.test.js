// src/services/espnApi/espnMessageHandler.test.js
import { describe, it, expect, vi, beforeEach } from 'vitest';
import browser from 'webextension-polyfill';
import * as espnApiService from './espnApiService';
import {
  handleEspnFetchRequest,
  registerEspnMessageHandler,
  ESPN_MESSAGE_TYPES,
} from './espnMessageHandler';

// Mock the browser API
vi.mock('webextension-polyfill', () => ({
  default: {
    runtime: {
      onMessage: {
        addListener: vi.fn(),
      },
    },
  },
}));

// Mock the ESPN API service
vi.mock('./espnApiService', () => ({
  executeEspnFetch: vi.fn(),
}));

describe('ESPN Message Handler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('handleEspnFetchRequest', () => {
    it('should return null for non-ESPN message types', async () => {
      const message = { type: 'SOME_OTHER_TYPE' };
      const result = await handleEspnFetchRequest(message, {});

      expect(result).toBeNull();
    });

    it('should handle successful fetch request', async () => {
      const mockLeagueData = {
        id: '59986587',
        seasonId: 2025,
        members: [{ displayName: 'Team 1' }],
      };

      espnApiService.executeEspnFetch.mockResolvedValue(mockLeagueData);

      const message = {
        type: ESPN_MESSAGE_TYPES.FETCH_LEAGUE_DATA,
        leagueId: '59986587',
      };

      const result = await handleEspnFetchRequest(message, {});

      expect(result.type).toBe(ESPN_MESSAGE_TYPES.LEAGUE_DATA_SUCCESS);
      expect(result.data).toEqual(mockLeagueData);
      expect(result.leagueId).toBe('59986587');
      expect(result.timestamp).toBeDefined();
    });

    it('should handle fetch errors', async () => {
      espnApiService.executeEspnFetch.mockRejectedValue(
        new Error('Network error')
      );

      const message = {
        type: ESPN_MESSAGE_TYPES.FETCH_LEAGUE_DATA,
        leagueId: '59986587',
      };

      const result = await handleEspnFetchRequest(message, {});

      expect(result.type).toBe(ESPN_MESSAGE_TYPES.LEAGUE_DATA_ERROR);
      expect(result.error).toBe('Network error');
      expect(result.leagueId).toBe('59986587');
      expect(result.timestamp).toBeDefined();
    });

    it('should include timestamp in response', async () => {
      espnApiService.executeEspnFetch.mockResolvedValue({ id: '123' });

      const message = {
        type: ESPN_MESSAGE_TYPES.FETCH_LEAGUE_DATA,
        leagueId: '123',
      };

      const result = await handleEspnFetchRequest(message, {});

      expect(result.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });
  });

  describe('registerEspnMessageHandler', () => {
    it('should register message listener with browser runtime', () => {
      registerEspnMessageHandler();

      expect(browser.runtime.onMessage.addListener).toHaveBeenCalledTimes(1);
      expect(browser.runtime.onMessage.addListener).toHaveBeenCalledWith(
        expect.any(Function)
      );
    });

    it('should handle async message responses correctly', async () => {
      let messageListener;

      browser.runtime.onMessage.addListener.mockImplementation((fn) => {
        messageListener = fn;
      });

      registerEspnMessageHandler();

      const mockSendResponse = vi.fn();
      const mockMessage = {
        type: ESPN_MESSAGE_TYPES.FETCH_LEAGUE_DATA,
        leagueId: '59986587',
      };

      espnApiService.executeEspnFetch.mockResolvedValue({ id: '123' });

      const returnValue = messageListener(mockMessage, {}, mockSendResponse);

      expect(returnValue).toBe(true); // Should return true for async

      // Wait for async operation
      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(mockSendResponse).toHaveBeenCalledWith(
        expect.objectContaining({
          type: ESPN_MESSAGE_TYPES.LEAGUE_DATA_SUCCESS,
        })
      );
    });

    it('should handle errors in message listener', async () => {
      let messageListener;

      browser.runtime.onMessage.addListener.mockImplementation((fn) => {
        messageListener = fn;
      });

      registerEspnMessageHandler();

      const mockSendResponse = vi.fn();
      const mockMessage = {
        type: ESPN_MESSAGE_TYPES.FETCH_LEAGUE_DATA,
        leagueId: '59986587',
      };

      espnApiService.executeEspnFetch.mockRejectedValue(
        new Error('Fetch failed')
      );

      messageListener(mockMessage, {}, mockSendResponse);

      // Wait for async operation
      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(mockSendResponse).toHaveBeenCalledWith(
        expect.objectContaining({
          type: ESPN_MESSAGE_TYPES.LEAGUE_DATA_ERROR,
          error: 'Fetch failed',
        })
      );
    });
  });
});
