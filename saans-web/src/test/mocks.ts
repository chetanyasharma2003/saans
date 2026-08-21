import { vi } from 'vitest';

// Mock localStorage
export const mockLocalStorage = () => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
};

// Mock Axios
export const mockAxios = {
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
  patch: vi.fn(),
  create: vi.fn(),
};

// Mock Razorpay
export const mockRazorpay = {
  open: vi.fn(),
  close: vi.fn(),
  on: vi.fn(),
  off: vi.fn(),
};

// Mock Socket.io
export const mockSocket = {
  on: vi.fn(),
  off: vi.fn(),
  emit: vi.fn(),
  disconnect: vi.fn(),
  connect: vi.fn(),
};

// Mock Groq API
export const mockGroqResponse = {
  choices: [
    {
      message: {
        content: 'Mock AI response for testing purposes.',
      },
    },
  ],
};

// Auth Response Mocks
export const mockLoginResponse = {
  accessToken: 'mock-access-token-123',
  user: {
    id: '1',
    email: 'test@example.com',
    name: 'Test User',
    role: 'PATIENT',
    city: 'Delhi',
    profileImage: 'https://example.com/avatar.jpg',
    phoneNumber: '+91-9876543210',
    bio: 'Test bio',
  },
};

export const mockRegisterResponse = {
  accessToken: 'mock-access-token-456',
  user: {
    id: '2',
    email: 'newuser@example.com',
    name: 'New User',
    role: 'PATIENT',
    city: 'Mumbai',
    profileImage: null,
    phoneNumber: null,
    bio: null,
  },
};

// Therapist Response Mocks
export const mockTherapistsResponse = {
  therapists: [
    {
      id: '101',
      name: 'Dr. John Smith',
      specialization: 'Anxiety & Depression',
      image: 'https://example.com/therapist1.jpg',
      city: 'Delhi',
      rating: 4.8,
      reviews: 45,
      hourlyRate: 500,
      availability: true,
    },
    {
      id: '102',
      name: 'Dr. Jane Doe',
      specialization: 'Relationship Counseling',
      image: 'https://example.com/therapist2.jpg',
      city: 'Delhi',
      rating: 4.9,
      reviews: 67,
      hourlyRate: 600,
      availability: true,
    },
  ],
  total: 2,
};

export const mockSingleTherapistResponse = {
  id: '101',
  name: 'Dr. John Smith',
  specialization: 'Anxiety & Depression',
  image: 'https://example.com/therapist1.jpg',
  city: 'Delhi',
  rating: 4.8,
  reviews: 45,
  hourlyRate: 500,
  availability: true,
  bio: 'Experienced therapist with 10+ years in mental health.',
};

// Mood Tracking Response Mocks
export const mockMoodResponse = {
  id: '1',
  userId: '1',
  mood: 'happy',
  intensity: 8,
  date: new Date().toISOString(),
  notes: 'Had a great day today',
};

export const mockMoodAnalyticsResponse = {
  averageMood: 7.5,
  moods: ['happy', 'good', 'neutral', 'sad', 'happy', 'good', 'neutral'],
  dates: [
    '2024-01-01',
    '2024-01-02',
    '2024-01-03',
    '2024-01-04',
    '2024-01-05',
    '2024-01-06',
    '2024-01-07',
  ],
};

// Appointment Response Mocks
export const mockAppointmentResponse = {
  id: '1',
  therapistId: '101',
  userId: '1',
  date: '2024-01-15',
  time: '10:00',
  status: 'confirmed',
  notes: 'First appointment',
};

export const mockAvailableSlotsResponse = {
  slots: [
    { date: '2024-01-15', times: ['10:00', '11:00', '14:00', '15:00'] },
    { date: '2024-01-16', times: ['09:00', '10:00', '11:00'] },
  ],
};

// Payment Response Mocks
export const mockPaymentOrderResponse = {
  id: 'order_123456',
  amount: 50000, // In paise (₹500)
  currency: 'INR',
  receipt: 'receipt_123456',
  status: 'created',
};

export const mockPaymentVerifyResponse = {
  success: true,
  message: 'Payment verified successfully',
  paymentId: 'pay_123456',
};

// Community Response Mocks
export const mockCommunitiesResponse = {
  communities: [
    {
      id: '1',
      name: 'Anxiety Support Group',
      description: 'A safe space to discuss anxiety',
      members: 150,
      image: 'https://example.com/community1.jpg',
    },
    {
      id: '2',
      name: 'Depression Recovery',
      description: 'Journey to recovery together',
      members: 200,
      image: 'https://example.com/community2.jpg',
    },
  ],
};

export const mockCommunityChatResponse = {
  messages: [
    {
      id: '1',
      userId: '1',
      userName: 'Test User',
      message: 'Hello community!',
      timestamp: new Date().toISOString(),
    },
    {
      id: '2',
      userId: '2',
      userName: 'Another User',
      message: 'Welcome!',
      timestamp: new Date().toISOString(),
    },
  ],
};

// Profile Response Mocks
export const mockProfileResponse = {
  id: '1',
  name: 'Test User',
  email: 'test@example.com',
  city: 'Delhi',
  state: 'Delhi',
  phoneNumber: '+91-9876543210',
  bio: 'Test bio',
  profileImage: 'https://example.com/avatar.jpg',
};

// Error Response Mocks
export const mockErrorResponse = {
  error: 'Invalid credentials',
  message: 'The email or password you entered is incorrect',
};

export const mockValidationErrorResponse = {
  error: {
    message: 'Validation failed',
    details: {
      email: 'Invalid email format',
      password: 'Password must be at least 6 characters',
    },
  },
};

// Utility function to create resolved promise
export const resolveWith = <T,>(data: T) => Promise.resolve(data);

// Utility function to create rejected promise
export const rejectWith = (error: any) => Promise.reject(error);

// Helper to create axios error
export const createAxiosError = (message: string, status: number = 400, data?: any) => ({
  response: {
    status,
    data: data || { error: message, message },
  },
  message,
});
