// src/services/espnApi/espnMessageHandler.js
import browser from 'webextension-polyfill';
import { executeEspnFetch } from './espnApiService';

/**
 * Message types for ESPN API communication
 */
export const ESPN_MESSAGE_TYPES = {
  FETCH_LEAGUE_DATA: 'ESPN_FETCH_LEAGUE_DATA',
  LEAGUE_DATA_SUCCESS: 'ESPN_LEAGUE_DATA_SUCCESS',
  LEAGUE_DATA_ERROR: 'ESPN_LEAGUE_DATA_ERROR',
};

/**
 * Handles ESPN API fetch requests from the popup
 * @param {Object} message - The message object
 * @param {Object} sender - The message sender
 * @returns {Promise<Object>} Response object with success/error status
 */
export async function handleEspnFetchRequest(message, sender) {
  if (message.type !== ESPN_MESSAGE_TYPES.FETCH_LEAGUE_DATA) {
    return null; // Not our message type
  }

  console.log('ESPN API: Handling fetch request for league:', message.leagueId);

  try {
    const data = await executeEspnFetch(message.leagueId);

    // Send response back
    return {
      type: ESPN_MESSAGE_TYPES.LEAGUE_DATA_SUCCESS,
      data: data,
      leagueId: message.leagueId,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error('ESPN API: Fetch failed:', error);

    return {
      type: ESPN_MESSAGE_TYPES.LEAGUE_DATA_ERROR,
      error: error.message,
      leagueId: message.leagueId,
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Registers the ESPN message handler with the browser runtime
 * Should be called once when the background script loads
 */
export function registerEspnMessageHandler() {
  browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === ESPN_MESSAGE_TYPES.FETCH_LEAGUE_DATA) {
      // Handle async response
      handleEspnFetchRequest(message, sender)
        .then(sendResponse)
        .catch((error) => {
          sendResponse({
            type: ESPN_MESSAGE_TYPES.LEAGUE_DATA_ERROR,
            error: error.message,
            leagueId: message.leagueId,
          });
        });

      // Return true to indicate async response
      return true;
    }
  });

  console.log('ESPN API: Message handler registered');
}
