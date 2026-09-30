const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'SAANS Mental Health Platform API',
      version: '1.0.0',
      description: 'API documentation for SAANS mental health platform',
      contact: {
        name: 'SAANS Team',
        email: 'support@saans.com',
      },
    },
    servers: [
      {
        url: process.env.API_URL || 'http://localhost:3001',
        description: 'API Server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            email: { type: 'string', format: 'email' },
            phone: { type: 'string' },
            bio: { type: 'string' },
            avatar: { type: 'string' },
            gender: { type: 'string', enum: ['male', 'female', 'other'] },
            dateOfBirth: { type: 'string', format: 'date' },
            address: { type: 'string' },
            city: { type: 'string' },
            state: { type: 'string' },
            zipCode: { type: 'string' },
            conditions: {
              type: 'array',
              items: { type: 'string' },
            },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Therapist: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            specialization: { type: 'array', items: { type: 'string' } },
            hourlyRate: { type: 'number' },
            rating: { type: 'number' },
            bio: { type: 'string' },
            languages: { type: 'array', items: { type: 'string' } },
          },
        },
        Appointment: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            userId: { type: 'string', format: 'uuid' },
            therapistId: { type: 'string', format: 'uuid' },
            sessionType: { type: 'string', enum: ['video', 'phone'] },
            scheduledAt: { type: 'string', format: 'date-time' },
            duration: { type: 'integer', minimum: 30, maximum: 120 },
            price: { type: 'number' },
            status: { type: 'string', enum: ['scheduled', 'confirmed', 'completed', 'cancelled'] },
            notes: { type: 'string' },
          },
        },
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            error: { type: 'string' },
            details: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  path: { type: 'string' },
                  message: { type: 'string' },
                },
              },
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./routes/*.js'],
};

module.exports = swaggerJsdoc(options);
