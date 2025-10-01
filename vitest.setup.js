import { vi } from 'vitest';
import '@testing-library/jest-dom';

// Mock webextension-polyfill globally
vi.mock('webextension-polyfill', () => {
  return {
    default: {
      runtime: {
        sendMessage: vi.fn(),
        onMessage: {
          addListener: vi.fn(),
        },
      },
      tabs: {
        query: vi.fn(),
        executeScript: vi.fn(),
      },
    },
  };
});
