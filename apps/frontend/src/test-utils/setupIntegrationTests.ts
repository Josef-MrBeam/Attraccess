import { mockToastHooks } from './mocks';

jest.mock('../components/toastProvider', () => ({
  __esModule: true,
  ToastProvider: mockToastHooks.ToastProvider,
  useToastMessage: mockToastHooks.useToastMessage,
}));

// Mock auth hook
jest.mock('../hooks/useAuth', () => ({
  __esModule: true,
  useAuth: () => ({
    isAuthenticated: true,
    isLoading: false,
    user: { id: '1', email: 'test@example.com' },
  }),
}));

// Mock theme hook
jest.mock('@heroui/use-theme', () => ({
  __esModule: true,
  useTheme: () => ({
    theme: 'light',
    setTheme: jest.fn(),
  }),
}));

// Mock the API module to handle import.meta
jest.mock('../api/index', () => ({
  __esModule: true,
  default: {
    baseUrl: 'http://localhost:3000',
  },
  filenameToUrl: (filename: string) =>
    `http://localhost:3000/resources/images/${filename}`,
}));
