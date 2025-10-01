// src/services/espnApi/espnApiService.js
import browser from 'webextension-polyfill';

/**
 * ESPN Fantasy Football API Configuration
 */
const ESPN_API_CONFIG = {
  BASE_URL: 'https://lm-api-reads.fantasy.espn.com',
  GAME: 'ffl',
  SEASON: 2025,
  SEGMENT: 0,
};

/**
 * Constructs the ESPN API URL for a given league
 * @param {string} leagueId - The ESPN league ID
 * @returns {string} The complete API URL
 */
export function buildEspnApiUrl(leagueId) {
  const { BASE_URL, GAME, SEASON, SEGMENT } = ESPN_API_CONFIG;
  return `${BASE_URL}/apis/v3/games/${GAME}/seasons/${SEASON}/segments/${SEGMENT}/leagues/${leagueId}`;
}

/**
 * Generates the fetch code to be executed in the active tab context
 * @param {string} url - The API URL to fetch
 * @returns {string} JavaScript code as a string
 */
function generateFetchCode(url) {
  return `
    (async () => {
      try {
        const response = await fetch("${url}", {
          credentials: "include"
        });
        
        if (!response.ok) {
          throw new Error(\`HTTP error! status: \${response.status}\`);
        }
        
        const data = await response.json();
        return data;
      } catch (error) {
        throw new Error(\`Fetch failed: \${error.message}\`);
      }
    })();
  `;
}

/**
 * Executes a fetch request in the active tab and returns the JSON data
 * @param {string} leagueId - The ESPN league ID
 * @returns {Promise<Object>} The JSON response from ESPN API
 * @throws {Error} If no active tab, no league ID, or fetch fails
 */
export async function executeEspnFetch(leagueId) {
  // Validate input
  if (!leagueId || leagueId.trim() === '') {
    throw new Error('League ID is required');
  }

  try {
    // Get the active tab
    const tabs = await browser.tabs.query({
      active: true,
      currentWindow: true,
    });

    if (tabs.length === 0) {
      throw new Error('No active tab found');
    }

    const activeTab = tabs[0];
    const apiUrl = buildEspnApiUrl(leagueId);
    const fetchCode = generateFetchCode(apiUrl);

    // Execute the fetch in the tab context
    const results = await browser.tabs.executeScript(activeTab.id, {
      code: fetchCode,
    });

    // Return the first result (there should only be one)
    return results[0];
  } catch (error) {
    throw new Error(`Failed to execute ESPN API fetch: ${error.message}`);
  }
}

/**
 * Validates if a league ID is in the correct format
 * @param {string} leagueId - The league ID to validate
 * @returns {boolean} True if valid, false otherwise
 */
export function isValidLeagueId(leagueId) {
  return /^\d+$/.test(leagueId);
}
