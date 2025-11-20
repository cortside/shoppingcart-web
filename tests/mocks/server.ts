import { setupServer } from 'msw/node';
import { handlers } from './handlers';

/**
 * Mock Service Worker server for Node.js tests
 * This intercepts HTTP requests during tests and returns mock responses
 */
export const server = setupServer(...handlers);
