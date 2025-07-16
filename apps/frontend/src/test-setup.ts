import '@testing-library/jest-dom';
import './test-utils/setupIntegrationTests';

// Mock import.meta for Vite environment variables
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(global as any).import = {
  meta: {
    env: {
      MODE: 'test',
    },
  },
};

// Mock window methods
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock scrollTo
window.scrollTo = jest.fn();

// Mock ResizeObserver
class MockResizeObserver implements ResizeObserver {
  observe = jest.fn();
  unobserve = jest.fn();
  disconnect = jest.fn();
}
global.ResizeObserver = MockResizeObserver;

// Mock IntersectionObserver
class MockIntersectionObserver implements IntersectionObserver {
  readonly root: Element | Document | null = null;
  readonly rootMargin: string = '0px';
  readonly thresholds: ReadonlyArray<number> = [0];

  // eslint-disable-next-line @typescript-eslint/no-useless-constructor
  constructor(
    callback: IntersectionObserverCallback,

    options?: IntersectionObserverInit
  ) {
    // This is a mock implementation, so we don't need to use the callback or options
  }

  observe = jest.fn();
  unobserve = jest.fn();
  disconnect = jest.fn();
  takeRecords = jest.fn().mockReturnValue([]);
}
global.IntersectionObserver = MockIntersectionObserver;

// Suppress console errors during tests
console.error = jest.fn();
