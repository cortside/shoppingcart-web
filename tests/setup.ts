import { beforeAll, afterEach, afterAll, vi } from 'vitest';

// Setup file for Vitest tests
// Mock the config utility to avoid loading from network
beforeAll(() => {
  // Mock config module to return test configuration
  vi.mock('@/utils/config', () => ({
    loadConfig: vi.fn().mockResolvedValue(undefined),
    getConfig: vi.fn().mockReturnValue({
      catalogApi: {
        url: 'https://mockserver.cortside.net/api/v1',
      },
      shoppingCartApi: {
        url: 'http://localhost:5000',
      },
      identity: {
        authority: 'http://localhost:5002',
        clientId: 'test-client-id',
        scope: 'openid profile email',
      },
    }),
  }));
});

afterEach(() => {
  // Cleanup after each test
});

afterAll(() => {
  // Global cleanup
});
