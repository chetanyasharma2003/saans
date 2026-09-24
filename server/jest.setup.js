// Jest setup
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key';
process.env.MONGODB_URI = 'mongodb://localhost:27017/saans-test';
process.env.GROQ_API_KEY = 'test-key';
process.env.EMAIL_USER = 'test@example.com';
process.env.EMAIL_PASSWORD = 'test-password';

// Increase timeout for integration tests
jest.setTimeout(10000);
