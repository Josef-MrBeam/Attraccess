/**
 * Mock implementations for toast hooks
 */
export const mockToastHooks = {
  ToastProvider: jest.fn(({ children }) => children),
  useToastMessage: jest.fn(() => ({
    success: jest.fn(),
    error: jest.fn(),
    warning: jest.fn(),
    info: jest.fn(),
  })),
};

/**
 * Resets all mocks
 */
export function resetAllMocks() {
  Object.values(mockToastHooks).forEach((mock) => mock.mockReset());
}

/**
 * Mock implementations for window methods
 */
export const mockWindow = {
  scrollTo: jest.fn(),
  matchMedia: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
};
