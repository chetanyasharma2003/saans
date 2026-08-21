import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore, PreloadedState } from '@reduxjs/toolkit';
import { ReactElement } from 'react';
import authReducer from '../redux/slices/authSlice';
import chatReducer from '../redux/slices/chatSlice';
import moodReducer from '../redux/slices/moodSlice';
import therapyReducer from '../redux/slices/therapySlice';
import notificationsReducer from '../redux/slices/notificationsSlice';
import { RootState } from '../redux/store';
import { mockLocalStorage } from './mocks';
import { vi } from 'vitest';

// Setup localStorage mock
export const setupLocalStorage = () => {
  const storage = mockLocalStorage();
  Object.defineProperty(window, 'localStorage', {
    value: storage,
    writable: true,
  });
  return storage;
};

// Create a test store with optional preloaded state
export function createTestStore(preloadedState?: PreloadedState<RootState>) {
  return configureStore({
    reducer: {
      auth: authReducer,
      chat: chatReducer,
      mood: moodReducer,
      therapy: therapyReducer,
      notifications: notificationsReducer,
    },
    preloadedState,
  });
}

// Custom render function with Redux Provider
interface ExtendedRenderOptions extends Omit<RenderOptions, 'queries'> {
  preloadedState?: PreloadedState<RootState>;
  store?: any;
}

export function renderWithRedux(
  ui: ReactElement,
  {
    preloadedState,
    store = createTestStore(preloadedState),
    ...renderOptions
  }: ExtendedRenderOptions = {}
) {
  function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(Provider, { store }, children);
  }

  return { ...render(ui, { wrapper: Wrapper, ...renderOptions }), store };
}

// Mock axios setup
export function setupAxiosMock() {
  return {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
    create: vi.fn(),
  };
}

// Mock window.matchMedia
export function setupMatchMediaMock() {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
}

// Mock IntersectionObserver
export function setupIntersectionObserverMock() {
  global.IntersectionObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  })) as any;
}

// Mock ResizeObserver
export function setupResizeObserverMock() {
  global.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  })) as any;
}

// Setup all global mocks
export function setupAllGlobalMocks() {
  setupLocalStorage();
  setupMatchMediaMock();
  setupIntersectionObserverMock();
  setupResizeObserverMock();
}

// Mock Razorpay
export function setupRazorpayMock() {
  (window as any).Razorpay = vi.fn((options: any) => ({
    open: vi.fn(() => {
      if (options.handler) {
        options.handler({
          razorpay_payment_id: 'pay_123456',
          razorpay_order_id: 'order_123456',
          razorpay_signature: 'sig_123456',
        });
      }
    }),
    close: vi.fn(),
  }));
}

// Mock Socket.io
export function setupSocketIOMock() {
  const mockSocket = {
    on: vi.fn(),
    off: vi.fn(),
    emit: vi.fn(),
    disconnect: vi.fn(),
    connect: vi.fn(),
    once: vi.fn(),
    removeListener: vi.fn(),
  };

  vi.mock('socket.io-client', () => ({
    default: vi.fn(() => mockSocket),
  }));

  return mockSocket;
}

// Wait for async updates
export async function waitForAsync() {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

// Create mock navigation
export function createMockNavigate() {
  return vi.fn();
}

// Create mock dispatch
export function createMockDispatch() {
  return vi.fn();
}

// Default test user
export const TEST_USER = {
  id: '1',
  email: 'test@example.com',
  name: 'Test User',
  role: 'PATIENT',
  city: 'Delhi',
  state: 'Delhi',
  phoneNumber: '+91-9876543210',
  bio: 'Test bio',
  profileImage: 'https://example.com/avatar.jpg',
};

// Default preloaded state with authenticated user
export const AUTHENTICATED_STATE: PreloadedState<RootState> = {
  auth: {
    user: TEST_USER,
    token: 'mock-token-123',
    isLoading: false,
    error: null,
    isAuthenticated: true,
  },
  chat: {
    messages: [],
    isLoading: false,
    error: null,
  },
  mood: {
    moods: [],
    isLoading: false,
    error: null,
  },
  therapy: {
    therapists: [],
    selectedTherapist: null,
    isLoading: false,
    error: null,
  },
  notifications: {
    notifications: [],
    unreadCount: 0,
  },
};

// Default preloaded state with unauthenticated user
export const UNAUTHENTICATED_STATE: PreloadedState<RootState> = {
  auth: {
    user: null,
    token: null,
    isLoading: false,
    error: null,
    isAuthenticated: false,
  },
  chat: {
    messages: [],
    isLoading: false,
    error: null,
  },
  mood: {
    moods: [],
    isLoading: false,
    error: null,
  },
  therapy: {
    therapists: [],
    selectedTherapist: null,
    isLoading: false,
    error: null,
  },
  notifications: {
    notifications: [],
    unreadCount: 0,
  },
};

// Utilities for common test scenarios
export const testUtils = {
  createTestUser: (overrides?: Partial<typeof TEST_USER>) => ({
    ...TEST_USER,
    ...overrides,
  }),

  createAuthenticatedState: (userOverrides?: Partial<typeof TEST_USER>) => ({
    ...AUTHENTICATED_STATE,
    auth: {
      ...AUTHENTICATED_STATE.auth,
      user: userOverrides ? { ...TEST_USER, ...userOverrides } : TEST_USER,
    },
  }),

  createUnauthenticatedState: () => UNAUTHENTICATED_STATE,
};

// Export testing utilities
export * from '@testing-library/react';
export { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';
export { vi } from 'vitest';
