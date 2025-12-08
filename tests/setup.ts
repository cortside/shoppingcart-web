import { vi, beforeAll, afterEach, afterAll } from 'vitest';
import { server } from './mocks/server';

// Mock configuration to avoid network calls during tests
// CRITICAL: vi.mock() must be at top-level, NOT inside beforeAll()
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

// Setup MSW (Mock Service Worker) for API mocking
beforeAll(() => {
  // Start intercepting requests
  server.listen({ onUnhandledRequest: 'warn' });
});

afterEach(() => {
  // Reset handlers after each test to ensure test isolation
  server.resetHandlers();
});

afterAll(() => {
  // Clean up and close the server
  server.close();
});
