const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'SAANS Mental Health Platform API',
      version: '2.0.0',
      description: 'Complete API documentation for SAANS',
      contact: {
        name: 'SAANS Support',
        email: 'support@saans.com',
        url: 'https://saans-mental-health.vercel.app'
      },
      license: {
        name: 'MIT'
      }
    },
    servers: [
      {
        url: 'https://saans-backend-tt8p.onrender.com/api',
        description: 'Production Server'
      },
      {
        url: 'http://localhost:3001/api',
        description: 'Development Server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            email: { type: 'string', format: 'email' },
            avatar: { type: 'string' }
          }
        },
        Therapist: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            name: { type: 'string' },
            specialty: { type: 'string' },
            rating: { type: 'number', format: 'float' },
            reviews: { type: 'number' },
            price: { type: 'number' },
            bio: { type: 'string' },
            languages: { type: 'array', items: { type: 'string' } },
            availability: { type: 'string' }
          }
        },
        Appointment: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            therapistId: { type: 'string' },
            date: { type: 'string', format: 'date' },
            time: { type: 'string' },
            type: { type: 'string', enum: ['Video', 'Phone', 'In-person'] },
            status: { type: 'string', enum: ['scheduled', 'completed', 'cancelled'] }
          }
        },
        Mood: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            mood: { type: 'number', minimum: 1, maximum: 5 },
            activities: { type: 'array', items: { type: 'string' } },
            notes: { type: 'string' },
            weather: { type: 'string' },
            sleepHours: { type: 'number' },
            stressLevel: { type: 'number', minimum: 1, maximum: 10 },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        Post: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            title: { type: 'string' },
            content: { type: 'string' },
            author: { $ref: '#/components/schemas/User' },
            likes: { type: 'number' },
            comments: { type: 'number' },
            createdAt: { type: 'string', format: 'date-time' }
          }
        }
      }
    }
  },
  apis: [
    './routes/auth.routes.js',
    './routes/therapists.routes.js',
    './routes/appointments.routes.js',
    './routes/mood.routes.js',
    './routes/community.routes.js',
    './routes/ai.routes.js'
  ]
};

const specs = swaggerJsdoc(options);

module.exports = specs;
