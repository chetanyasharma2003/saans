import { configureStore, PreloadedState } from '@reduxjs/toolkit';
import authReducer from '../redux/slices/authSlice';

export interface RootState {
  auth: {
    isAuthenticated: boolean;
    user: any | null;
    token: string | null;
    loading: boolean;
    error: string | null;
  };
}

// Setup localStorage mock
export const setupLocalStorage = () => {
  const localStorageMock = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
  };
  Object.defineProperty(window, 'localStorage', { value: localStorageMock });
  return localStorageMock;
};

// Render with Redux
export const renderWithRedux = (
  ui: React.ReactElement,
  {
    preloadedState,
    ...renderOptions
  }: {
    preloadedState?: PreloadedState<RootState>;
  } & any = {}
) => {
  const testStore = configureStore({
    reducer: {
      auth: authReducer,
    },
    preloadedState,
  });

  return { ...renderOptions, store: testStore };
};

// Authenticated state
export const AUTHENTICATED_STATE: PreloadedState<RootState> = {
  auth: {
    isAuthenticated: true,
    user: {
      _id: 'test-user-123',
      email: 'test@example.com',
      name: 'Test User',
      role: 'user',
      phone: '+919876543210',
    },
    token: 'test-jwt-token-123',
    loading: false,
    error: null,
  },
};

// Unauthenticated state
export const UNAUTHENTICATED_STATE: PreloadedState<RootState> = {
  auth: {
    isAuthenticated: false,
    user: null,
    token: null,
    loading: false,
    error: null,
  },
};

// Admin authenticated state
export const ADMIN_AUTHENTICATED_STATE: PreloadedState<RootState> = {
  auth: {
    isAuthenticated: true,
    user: {
      _id: 'test-admin-123',
      email: 'admin@saans.com',
      name: 'Admin User',
      role: 'admin',
      phone: '+919876543210',
    },
    token: 'test-admin-jwt-token-123',
    loading: false,
    error: null,
  },
};

// Therapist authenticated state
export const THERAPIST_AUTHENTICATED_STATE: PreloadedState<RootState> = {
  auth: {
    isAuthenticated: true,
    user: {
      _id: 'test-therapist-123',
      email: 'therapist@saans.com',
      name: 'Dr. Test Therapist',
      role: 'therapist',
      phone: '+919876543210',
    },
    token: 'test-therapist-jwt-token-123',
    loading: false,
    error: null,
  },
};

// Setup Razorpay mock
export const setupRazorpayMock = () => {
  const mockRazorpay = jest.fn((options) => {
    options.handler({
      razorpay_payment_id: 'pay_test_123',
      razorpay_order_id: 'order_test_123',
      razorpay_signature: 'sig_test_123',
    });
  });

  (window as any).Razorpay = mockRazorpay;
  return mockRazorpay;
};

// Setup Stripe mock
export const setupStripeMock = () => {
  const mockStripe = {
    elements: jest.fn(() => ({
      create: jest.fn(),
    })),
    confirmCardPayment: jest.fn(),
    confirmCardSetup: jest.fn(),
  };

  (window as any).Stripe = jest.fn(() => mockStripe);
  return mockStripe;
};

// Setup Agora mock
export const setupAgoraMock = () => {
  const mockClient = {
    init: jest.fn(),
    setClientRole: jest.fn(),
    join: jest.fn(),
    leave: jest.fn(),
    publish: jest.fn(),
    unpublish: jest.fn(),
    on: jest.fn(),
  };

  const mockRTC = {
    createClient: jest.fn(() => mockClient),
    createMicrophoneAudioTrack: jest.fn(),
    createCameraVideoTrack: jest.fn(),
  };

  (window as any).AgoraRTC = mockRTC;
  return { mockRTC, mockClient };
};

// Mock API response
export const mockApiResponse = (data: any, status = 200) => {
  return Promise.resolve({
    status,
    data,
    headers: {},
    statusText: 'OK',
    config: {},
  });
};

// Mock API error
export const mockApiError = (message: string, status = 400) => {
  return Promise.reject({
    response: {
      status,
      data: { error: message },
    },
    message,
  });
};

// Cleanup after tests
export const setupCleanup = () => {
  afterEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });
};
