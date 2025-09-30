import { cleanup } from '@testing-library/react';
import { expect, afterEach } from 'vitest';
import '@testing-library/jest-dom/vitest';

// Cleanup after each test
afterEach(() => {
  cleanup();
});
