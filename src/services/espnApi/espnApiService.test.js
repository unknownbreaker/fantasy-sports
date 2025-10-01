// src/services/espnApi/espnApiService.test.js
import { describe, it, expect, vi, beforeEach } from 'vitest';
import browser from 'webextension-polyfill';
import { executeEspnFetch } from './espnApiService';

// Mock the browser API
vi.mock('webextension-polyfill', () => ({
  default: {
    tabs: {
      query: vi.fn(),
      executeScript: vi.fn(),
    },
  },
}));

describe('ESPN API Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('executeEspnFetch', () => {
    it('should fetch data from ESPN API and return JSON', async () => {
      const mockLeagueId = '59986587';
      const mockResponse = {
        id: '59986587',
        seasonId: 2025,
        members: [{ displayName: 'Team 1' }],
      };

      // Mock active tab
      browser.tabs.query.mockResolvedValue([{ id: 1 }]);

      // Mock executeScript to simulate successful fetch
      browser.tabs.executeScript.mockResolvedValue([mockResponse]);

      const result = await executeEspnFetch(mockLeagueId);

      expect(browser.tabs.query).toHaveBeenCalledWith({
        active: true,
        currentWindow: true,
      });

      expect(browser.tabs.executeScript).toHaveBeenCalledWith(1, {
        code: expect.stringContaining(
          `https://lm-api-reads.fantasy.espn.com/apis/v3/games/ffl/seasons/2025/segments/0/leagues/${mockLeagueId}`
        ),
      });

      expect(result).toEqual(mockResponse);
    });

    it('should handle fetch errors gracefully', async () => {
      const mockLeagueId = '59986587';

      browser.tabs.query.mockResolvedValue([{ id: 1 }]);
      browser.tabs.executeScript.mockRejectedValue(new Error('Network error'));

      await expect(executeEspnFetch(mockLeagueId)).rejects.toThrow(
        'Failed to execute ESPN API fetch'
      );
    });

    it('should throw error when no active tab is found', async () => {
      browser.tabs.query.mockResolvedValue([]);

      await expect(executeEspnFetch('59986587')).rejects.toThrow(
        'No active tab found'
      );
    });

    it('should throw error when league ID is missing', async () => {
      await expect(executeEspnFetch()).rejects.toThrow('League ID is required');

      await expect(executeEspnFetch('')).rejects.toThrow(
        'League ID is required'
      );
    });

    it('should handle empty response from API', async () => {
      browser.tabs.query.mockResolvedValue([{ id: 1 }]);
      browser.tabs.executeScript.mockResolvedValue([null]);

      const result = await executeEspnFetch('59986587');

      expect(result).toBeNull();
    });

    it('should use credentials: include in fetch request', async () => {
      browser.tabs.query.mockResolvedValue([{ id: 1 }]);
      browser.tabs.executeScript.mockResolvedValue([{ success: true }]);

      await executeEspnFetch('59986587');

      const executeScriptCall = browser.tabs.executeScript.mock.calls[0][1];
      expect(executeScriptCall.code).toContain('credentials: "include"');
    });

    it('should construct correct URL with league ID', async () => {
      const leagueId = '12345678';
      browser.tabs.query.mockResolvedValue([{ id: 1 }]);
      browser.tabs.executeScript.mockResolvedValue([{}]);

      await executeEspnFetch(leagueId);

      const executeScriptCall = browser.tabs.executeScript.mock.calls[0][1];
      expect(executeScriptCall.code).toContain(`leagues/${leagueId}`);
    });

    it('should handle JSON parsing errors', async () => {
      browser.tabs.query.mockResolvedValue([{ id: 1 }]);

      // Simulate a response that can't be parsed as JSON
      browser.tabs.executeScript.mockResolvedValue(['Invalid JSON response']);

      const result = await executeEspnFetch('59986587');

      // The function should return whatever executeScript returns
      expect(result).toBe('Invalid JSON response');
    });
  });
});
