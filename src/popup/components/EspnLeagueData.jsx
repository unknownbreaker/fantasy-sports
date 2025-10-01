// src/popup/components/EspnLeagueData.jsx
import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import browser from 'webextension-polyfill';
import { ESPN_MESSAGE_TYPES } from '../../services/espnApi/espnMessageHandler';

/**
 * Fetches ESPN league data by sending a message to the background script
 * @param {string} leagueId - The ESPN league ID
 * @returns {Promise<Object>} The league data
 */
async function fetchEspnLeagueData(leagueId) {
  const response = await browser.runtime.sendMessage({
    type: ESPN_MESSAGE_TYPES.FETCH_LEAGUE_DATA,
    leagueId: leagueId,
  });

  if (response.type === ESPN_MESSAGE_TYPES.LEAGUE_DATA_ERROR) {
    throw new Error(response.error);
  }

  return response.data;
}

/**
 * Component for fetching and displaying ESPN league data
 */
export default function EspnLeagueData() {
  const [leagueId, setLeagueId] = useState('59986587');
  const [leagueData, setLeagueData] = useState(null);

  const mutation = useMutation({
    mutationFn: fetchEspnLeagueData,
    onSuccess: (data) => {
      setLeagueData(data);
      console.log('ESPN League Data:', data);
    },
    onError: (error) => {
      console.error('Failed to fetch ESPN data:', error);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (leagueId.trim()) {
      mutation.mutate(leagueId);
    }
  };

  return (
    <div className="espn-league-data">
      <h2>ESPN League Data Fetcher</h2>

      <form onSubmit={handleSubmit} className="espn-form">
        <div className="form-group">
          <label htmlFor="leagueId">League ID:</label>
          <input
            type="text"
            id="leagueId"
            value={leagueId}
            onChange={(e) => setLeagueId(e.target.value)}
            placeholder="Enter ESPN league ID"
            disabled={mutation.isPending}
          />
        </div>

        <button type="submit" disabled={mutation.isPending || !leagueId.trim()}>
          {mutation.isPending ? 'Fetching...' : 'Fetch League Data'}
        </button>
      </form>

      {mutation.isError && (
        <div className="error-message">
          <strong>Error:</strong> {mutation.error.message}
        </div>
      )}

      {mutation.isSuccess && leagueData && (
        <div className="league-data-display">
          <h3>League Information</h3>
          <pre>{JSON.stringify(leagueData, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
