# 🚀 SAANS - Implementation Roadmap
## Week-by-Week Development Plan (8-10 Weeks to MVP)

**Timeline:** September 2026 - November 2026  
**Team Size:** 5 people  
**Status:** Ready to Execute  

---

# TIMELINE OVERVIEW

```
WEEK 1-2: INFRASTRUCTURE & SETUP
├─ Frontend boilerplate
├─ Backend boilerplate
├─ Database schema
└─ CI/CD pipeline

WEEK 3-4: CORE AUTHENTICATION & USER MANAGEMENT
├─ User registration/login
├─ JWT authentication
├─ User profiles
└─ Subscription management

WEEK 5-6: AI COUNSELOR & CHAT SYSTEM
├─ Chat interface (frontend)
├─ Real-time messaging (Socket.io)
├─ AI counselor backend
├─ Claude API integration
└─ Crisis detection

WEEK 7-8: THERAPIST MARKETPLACE & BOOKING
├─ Therapist profiles
├─ Availability management
├─ Booking system
├─ Session scheduling
└─ Video call integration

WEEK 9-10: TESTING, REFINEMENT & DEPLOYMENT
├─ Comprehensive testing
├─ Security audit
├─ Performance optimization
├─ Production deployment
└─ Beta launch
```

---

# DETAILED WEEK-BY-WEEK BREAKDOWN

## WEEK 1: PROJECT SETUP & INFRASTRUCTURE

### Goals
- Set up complete development environment
- Initialize Git repository with CI/CD
- Create database
- Deploy boilerplate apps

### Frontend (React + Vite)

```bash
# Task 1: Initialize project
npm create vite@latest saans-web -- --template react-ts
cd saans-web
npm install

# Task 2: Install dependencies
npm install \
  react-router-dom \
  @reduxjs/toolkit \
  react-redux \
  @mui/material @emotion/react @emotion/styled \
  tailwindcss \
  socket.io-client \
  axios \
  zod \
  react-hook-form \
  recharts

# Task 3: Project structure
mkdir -p src/{components,pages,redux,hooks,services,types,utils,styles}

# Task 4: Initialize Tailwind
npx tailwindcss init -p

# Task 5: Setup Redux store
# Create /src/redux/store.ts
# Create slices: auth, user, chat, mood, therapy, crisis

# Task 6: Setup routing
# Create App.tsx with React Router
# Create basic layout & pages skeleton
```

**Deliverables:**
- ✅ Working React + Vite app
- ✅ Redux store configured
- ✅ Routing setup
- ✅ UI component library

### Backend (Node.js + Express)

```bash
# Task 1: Initialize project
mkdir saans-api
cd saans-api
npm init -y

# Task 2: Install dependencies
npm install \
  express \
  typescript \
  ts-node \
  @prisma/client \
  dotenv \
  cors \
  socket.io \
  jsonwebtoken \
  bcryptjs \
  axios \
  joi

# Task 3: Setup TypeScript
npx tsc --init

# Task 4: Initialize Prisma
npx prisma init

# Task 5: Project structure
mkdir -p src/{routes,controllers,services,middleware,config,utils,types}

# Task 6: Create Express app skeleton
# Create /src/app.ts with Express setup
# Create /src/index.ts as entry point
```

**Deliverables:**
- ✅ Express server running
- ✅ TypeScript configured
- ✅ Prisma ORM setup
- ✅ Basic middleware pipeline

### Database Setup

```sql
-- Task 1: Create PostgreSQL database
createdb saans_development
createdb saans_test

-- Task 2: Setup connection pool
-- PgBouncer configuration (optional, for production)

-- Task 3: Prisma schema
-- Create prisma/schema.prisma with all models

-- Task 4: Run migrations
npx prisma migrate dev --name init
npx prisma generate
```

**Deliverables:**
- ✅ PostgreSQL database created
- ✅ Prisma schema defined
- ✅ Migrations working
- ✅ Data models ready

### CI/CD Setup

```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '24'
      
      # Frontend tests
      - name: Frontend - Install & Test
        run: |
          cd saans-web
          npm install
          npm run lint
          npm run test
      
      # Backend tests
      - name: Backend - Install & Test
        run: |
          cd saans-api
          npm install
          npm run lint
          npm run test

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Build Frontend
        run: cd saans-web && npm install && npm run build
      - name: Build Backend
        run: cd saans-api && npm install && npm run build
```

**Deliverables:**
- ✅ GitHub Actions CI/CD configured
- ✅ Automated testing pipeline
- ✅ Build verification

### Deployment Infrastructure

```yaml
# render.com deployment config
# deploy-frontend.yml
services:
  - name: saans-web
    env: static
    buildCommand: npm install && npm run build
    staticPublishPath: ./dist
    envVars:
      - key: VITE_API_URL
        value: https://saans-api.onrender.com

# deploy-backend.yml
services:
  - name: saans-api
    env: node
    buildCommand: npm install && npm run build
    startCommand: npm start
    envVars:
      - key: DATABASE_URL
        value: $DATABASE_URL
      - key: REDIS_URL
        value: $REDIS_URL
      - key: JWT_SECRET
        value: $JWT_SECRET
```

**Deliverables:**
- ✅ Render deployment configured
- ✅ Environment variables setup
- ✅ Auto-deployment ready

### Week 1 Testing Checklist

```
✅ Frontend server running: http://localhost:5173
✅ Backend server running: http://localhost:3000
✅ Database connected
✅ CI/CD pipeline working
✅ Deployments successful (staging)
✅ GitHub Actions passing
```

---

## WEEK 2: AUTHENTICATION SYSTEM

### Goals
- Implement user registration & login
- JWT token management
- Password security
- Email verification

### Frontend Authentication

```typescript
// /src/pages/RegisterPage.tsx
import React from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { authApi } from '@/redux/api/authApi';
import { setUser } from '@/redux/slices/authSlice';

export const RegisterPage: React.FC = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const dispatch = useDispatch();
  const [registerMutation] = authApi.useRegisterMutation();

  const onSubmit = async (data) => {
    try {
      const response = await registerMutation({
        email: data.email,
        password: data.password,
        name: data.name,
        role: 'patient',
      }).unwrap();

      // Store tokens
      localStorage.setItem('accessToken', response.accessToken);
      localStorage.setItem('refreshToken', response.refreshToken);

      // Update Redux
      dispatch(setUser(response.user));

      // Navigate to dashboard
      navigate('/dashboard');
    } catch (error) {
      console.error('Registration failed', error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('email', { required: true })} />
      <input {...register('name', { required: true })} />
      <input {...register('password', { required: true })} type="password" />
      <button type="submit">Register</button>
    </form>
  );
};
```

### Backend Authentication

```typescript
// /src/services/authService.ts
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

export class AuthService {
  constructor(private prisma: PrismaClient) {}

  async register(email: string, password: string, name: string, role: string) {
    // Validate inputs
    if (!email || !password || !name) {
      throw new Error('Missing required fields');
    }

    // Check if user exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new Error('User already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role,
      },
    });

    // Generate tokens
    const tokens = this.generateTokens(user.id);

    return { user, ...tokens };
  }

  async login(email: string, password: string) {
    // Find user
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      throw new Error('Invalid credentials');
    }

    // Generate tokens
    const tokens = this.generateTokens(user.id);

    // Update lastLogin
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    return { user, ...tokens };
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = jwt.verify(
        refreshToken,
        process.env.JWT_REFRESH_SECRET!,
      ) as { userId: string };

      const user = await this.prisma.user.findUnique({
        where: { id: payload.userId },
      });

      if (!user) {
        throw new Error('User not found');
      }

      const newTokens = this.generateTokens(user.id);
      return { user, ...newTokens };
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }

  private generateTokens(userId: string) {
    const accessToken = jwt.sign(
      { userId },
      process.env.JWT_SECRET!,
      { expiresIn: '15m' },
    );

    const refreshToken = jwt.sign(
      { userId },
      process.env.JWT_REFRESH_SECRET!,
      { expiresIn: '7d' },
    );

    return { accessToken, refreshToken };
  }
}
```

### Authentication Routes

```typescript
// /src/routes/auth.routes.ts
import { Router } from 'express';
import { AuthController } from '@/controllers/authController';

const router = Router();
const authController = new AuthController();

router.post('/register', (req, res) =>
  authController.register(req, res),
);

router.post('/login', (req, res) =>
  authController.login(req, res),
);

router.post('/refresh-token', (req, res) =>
  authController.refreshToken(req, res),
);

router.post('/logout', (req, res) =>
  authController.logout(req, res),
);

export default router;
```

### Email Verification

```typescript
// /src/services/emailService.ts
import nodemailer from 'nodemailer';

export class EmailService {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'SendGrid',
      auth: {
        user: 'apikey',
        pass: process.env.SENDGRID_API_KEY,
      },
    });
  }

  async sendVerificationEmail(email: string, token: string) {
    const verificationLink = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

    await this.transporter.sendMail({
      from: 'noreply@saans.app',
      to: email,
      subject: 'Verify your SAANS account',
      html: `
        <h2>Welcome to SAANS!</h2>
        <p>Please verify your email by clicking the link below:</p>
        <a href="${verificationLink}">Verify Email</a>
      `,
    });
  }

  async sendPasswordResetEmail(email: string, token: string) {
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

    await this.transporter.sendMail({
      from: 'noreply@saans.app',
      to: email,
      subject: 'Reset your SAANS password',
      html: `
        <h2>Password Reset Request</h2>
        <p>Click the link below to reset your password:</p>
        <a href="${resetLink}">Reset Password</a>
      `,
    });
  }
}
```

### Week 2 Testing Checklist

```
✅ User registration working
✅ User login working
✅ JWT tokens generated correctly
✅ Password hashing secure
✅ Refresh token working
✅ Email verification sent
✅ Password reset working
✅ Protected routes working
```

---

## WEEK 3-4: AI COUNSELOR & CHAT SYSTEM

### Goals
- Build chat interface
- Integrate Claude API
- Implement real-time messaging (Socket.io)
- Crisis detection system
- Message history

### Frontend Chat Interface

```typescript
// /src/components/chat/ChatWindow.tsx
import React, { useEffect, useRef, useState } from 'react';
import { useSocket } from '@/hooks/useSocket';
import { useDispatch, useSelector } from 'react-redux';
import MessageBubble from './MessageBubble';
import InputArea from './InputArea';

export const ChatWindow: React.FC = () => {
  const dispatch = useDispatch();
  const { socket, isConnected } = useSocket();
  const { currentChat, isLoading } = useSelector((state) => state.chat);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [inputText, setInputText] = useState('');

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentChat]);

  const handleSendMessage = (message: string) => {
    if (!isConnected || !message.trim()) return;

    // Emit to server
    socket?.emit('message:send', {
      conversationId: currentChat[0]?.conversationId,
      content: message,
      timestamp: new Date(),
    });

    // Add to local state optimistically
    dispatch(addMessage({
      id: `temp-${Date.now()}`,
      content: message,
      sender: 'user',
      timestamp: new Date(),
    }));

    setInputText('');
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm p-4 border-b">
        <h2 className="text-xl font-semibold">Chat with SAANS Counselor</h2>
        <p className="text-sm text-gray-600">
          {isConnected ? '🟢 Connected' : '🔴 Offline'}
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {currentChat.map((msg) => (
          <MessageBubble
            key={msg.id}
            message={msg}
            isAI={msg.sender === 'ai'}
          />
        ))}

        {isLoading && (
          <div className="flex items-center space-x-2 p-3 bg-gray-100 rounded-lg">
            <div className="animate-pulse">...</div>
            <span>SAANS is typing...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <InputArea
        onSendMessage={handleSendMessage}
        isLoading={isLoading}
        disabled={!isConnected}
      />
    </div>
  );
};
```

### Backend AI Counselor Service

```typescript
// /src/services/aiCounselorService.ts
import Anthropic from '@anthropic-ai/sdk';
import { CrisisDetectionService } from './crisisDetectionService';

export class AICounselorService {
  private client: Anthropic;
  private crisisDetection: CrisisDetectionService;

  constructor() {
    this.client = new Anthropic({
      apiKey: process.env.CLAUDE_API_KEY,
    });
    this.crisisDetection = new CrisisDetectionService();
  }

  async generateResponse(
    conversationId: string,
    userId: string,
    userMessage: string,
  ) {
    // 1. Detect crisis first
    const crisisLevel = await this.crisisDetection.detectCrisis(userMessage);

    if (crisisLevel !== 'none') {
      // Return crisis response immediately
      return this.getCrisisResponse(crisisLevel, userMessage);
    }

    // 2. Get conversation history
    const history = await this.getConversationHistory(conversationId);

    // 3. Build messages array for Claude
    const messages = [
      ...history.map((msg) => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.content,
      })),
      { role: 'user', content: userMessage },
    ];

    // 4. Call Claude API
    const response = await this.client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 500,
      system: this.getSystemPrompt(),
      messages,
    });

    const aiResponse = response.content[0];

    if (aiResponse.type !== 'text') {
      throw new Error('Unexpected response type from Claude');
    }

    // 5. Analyze response for mood, topics, etc.
    const analysis = await this.analyzeResponse(userMessage, aiResponse.text);

    return {
      content: aiResponse.text,
      detectedMood: analysis.mood,
      topics: analysis.topics,
      requiresFollowup: analysis.requiresFollowup,
    };
  }

  private getSystemPrompt(): string {
    return `You are SAANS, an empathetic AI mental health counselor. Your role is to:

1. LISTEN actively and with deep compassion
2. VALIDATE the user's feelings and experiences
3. PROVIDE practical, evidence-based coping strategies
4. ENCOURAGE professional help when appropriate

IMPORTANT GUIDELINES:
- You are NOT a replacement for licensed therapists
- Be warm, non-judgmental, and truly supportive
- Ask clarifying questions to understand their situation better
- Use simple, clear language
- End each message with a practical suggestion or actionable advice

CRISIS HANDLING:
- If the user mentions suicidal thoughts, self-harm, or severe distress:
  - Express genuine concern
  - Validate their pain
  - Strongly encourage immediate professional help
  - Provide crisis helpline number

THERAPEUTIC TECHNIQUES:
- Use CBT principles when appropriate
- Suggest mindfulness techniques
- Help them identify triggers and patterns
- Celebrate small wins and progress
- Normalize their feelings

Always remember: Your goal is to support, not diagnose.`;
  }

  private async analyzeResponse(
    userMessage: string,
    aiResponse: string,
  ) {
    // Simple analysis - can be enhanced with NLP
    return {
      mood: this.detectMood(userMessage),
      topics: this.extractTopics(userMessage),
      requiresFollowup: this.checkRequiresFollowup(userMessage),
    };
  }

  private detectMood(text: string): string {
    const lowerText = text.toLowerCase();

    if (lowerText.includes('happy') || lowerText.includes('good')) return 'happy';
    if (lowerText.includes('sad') || lowerText.includes('down')) return 'sad';
    if (lowerText.includes('anxious') || lowerText.includes('worried')) return 'anxious';
    if (lowerText.includes('angry') || lowerText.includes('frustrated')) return 'angry';

    return 'neutral';
  }

  private extractTopics(text: string): string[] {
    const topics: string[] = [];

    if (text.toLowerCase().includes('work') || text.includes('job')) topics.push('work');
    if (text.toLowerCase().includes('relationship') || text.includes('partner')) topics.push('relationships');
    if (text.toLowerCase().includes('family')) topics.push('family');
    if (text.toLowerCase().includes('school') || text.includes('study')) topics.push('education');
    if (text.toLowerCase().includes('health') || text.includes('illness')) topics.push('health');
    if (text.toLowerCase().includes('sleep') || text.includes('tired')) topics.push('sleep');
    if (text.toLowerCase().includes('anxiety') || text.includes('panic')) topics.push('anxiety');

    return topics;
  }

  private checkRequiresFollowup(text: string): boolean {
    // Check if this needs therapist follow-up
    const keywords = ['suicide', 'harm', 'abuse', 'trauma', 'crisis'];
    return keywords.some((kw) => text.toLowerCase().includes(kw));
  }

  private getCrisisResponse(level: string, userMessage: string) {
    const responses: Record<string, string> = {
      high: `I'm genuinely concerned about what you're going through. Your feelings matter, and you deserve immediate support from a trained professional.

Please reach out to a crisis helpline right now:
🆘 AASRA: 9820466726
🆘 iCall: 9152987821
🆘 Vandrevala Foundation: 9999 666 555

If you're in immediate danger, please call 112 or go to the nearest hospital.

I'm here to support you, but a trained counselor can provide immediate help. Will you reach out to one of these numbers?`,

      medium: `I can sense you're going through something difficult. Your feelings are valid, and it's important to talk to someone who can provide deeper support.

I'd recommend connecting with a therapist on SAANS. In the meantime:
- Practice deep breathing (4-7-8 technique)
- Reach out to someone you trust
- Take a break from stressors if possible

Would you like me to help you find a therapist?`,

      low: `Thank you for sharing this with me. It takes courage to talk about what's bothering you.

Here are some things that might help:
- Journaling your feelings
- Taking a short walk or stretch
- Talking to someone you trust
- Practicing mindfulness

Remember, small steps lead to big changes. How are you feeling right now?`,
    };

    return {
      content: responses[level] || responses['low'],
      detectedMood: 'distressed',
      topics: ['crisis', 'mental-health'],
      requiresFollowup: level !== 'low',
    };
  }

  private async getConversationHistory(conversationId: string) {
    // Retrieve from database
    const messages = await prisma.chatMessage.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
      take: 20, // Last 20 messages
    });

    return messages;
  }
}
```

### Socket.io Integration

```typescript
// /src/websocket/socketHandler.ts
import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { ChatService } from '@/services/chatService';
import { AICounselorService } from '@/services/aiCounselorService';

export function setupSocketIO(httpServer: HTTPServer) {
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL,
      credentials: true,
    },
  });

  const chatService = new ChatService();
  const aiCounselor = new AICounselorService();

  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Join conversation room
    socket.on('conversation:join', (conversationId) => {
      socket.join(`conversation:${conversationId}`);
      socket.emit('status', { status: 'connected' });
    });

    // Handle incoming message
    socket.on('message:send', async (data) => {
      try {
        const { conversationId, content, userId } = data;

        // Save user message
        const userMsg = await chatService.saveMessage(
          conversationId,
          userId,
          content,
          'user',
        );

        // Emit to room
        io.to(`conversation:${conversationId}`).emit('message:received', userMsg);

        // Emit typing indicator
        socket.emit('ai:typing', true);

        // Generate AI response
        const aiResponse = await aiCounselor.generateResponse(
          conversationId,
          userId,
          content,
        );

        // Save AI message
        const aiMsg = await chatService.saveMessage(
          conversationId,
          null,
          aiResponse.content,
          'ai',
          {
            mood: aiResponse.detectedMood,
            topics: aiResponse.topics,
          },
        );

        // Stop typing
        socket.emit('ai:typing', false);

        // Send AI response
        io.to(`conversation:${conversationId}`).emit('message:received', aiMsg);

        // Handle crisis if detected
        if (aiResponse.requiresFollowup) {
          socket.emit('crisis:detected', {
            level: 'medium',
            message: 'We recommend speaking with a therapist.',
          });
        }
      } catch (error) {
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });

  return io;
}
```

### Week 3-4 Testing Checklist

```
✅ Chat window displays correctly
✅ Messages send and receive in real-time
✅ AI responds to user messages
✅ Crisis detection working
✅ Socket.io connection stable
✅ Message history saved
✅ Mood detection working
✅ UI responsive on mobile
```

---

## WEEK 5-6: THERAPIST MARKETPLACE

### Goals
- Therapist profiles
- Availability management
- Booking system
- Session scheduling

### Therapist Profile Component

```typescript
// /src/components/therapy/TherapistCard.tsx
import React from 'react';
import { Star, Clock, MapPin } from 'lucide-react';

interface TherapistCardProps {
  therapist: any;
  onBook: () => void;
}

export const TherapistCard: React.FC<TherapistCardProps> = ({
  therapist,
  onBook,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
      {/* Profile */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold">{therapist.name}</h3>
          <p className="text-sm text-gray-600">{therapist.specialization.join(', ')}</p>
        </div>
        <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
          {therapist.yearsOfExperience} years
        </div>
      </div>

      {/* Rating */}
      <div className="flex items-center space-x-2 mb-3">
        <div className="flex items-center">
          {Array(5).fill(0).map((_, i) => (
            <Star
              key={i}
              size={16}
              className={i < Math.floor(therapist.averageRating)
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'}
            />
          ))}
        </div>
        <span className="text-sm text-gray-600">
          {therapist.averageRating}/5 ({therapist.totalReviews})
        </span>
      </div>

      {/* Bio */}
      <p className="text-gray-700 text-sm mb-4">{therapist.bio}</p>

      {/* Price & Availability */}
      <div className="space-y-2 mb-4 pb-4 border-b">
        <div className="flex items-center justify-between">
          <span className="text-gray-600">Session Rate</span>
          <span className="font-semibold">₹{therapist.hourlyRate}/hour</span>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Clock size={16} />
          <span>{therapist.availableSlots.length} slots available</span>
        </div>
      </div>

      {/* Book Button */}
      <button
        onClick={onBook}
        className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
      >
        Book Session
      </button>
    </div>
  );
};
```

### Booking System

```typescript
// /src/services/therapyService.ts
import { PrismaClient } from '@prisma/client';

export class TherapyService {
  constructor(private prisma: PrismaClient) {}

  async getAvailableTherapists(specialization?: string, date?: Date) {
    const query: any = {
      where: {
        isAvailable: true,
      },
      include: {
        therapist: true,
        availableSlots: true,
      },
    };

    if (specialization) {
      query.where.specialization = {
        hasSome: [specialization],
      };
    }

    return this.prisma.therapist.findMany(query);
  }

  async createBooking(
    userId: string,
    therapistId: string,
    scheduledAt: Date,
    duration: number,
  ) {
    // Check if slot is available
    const existingBooking = await this.prisma.therapyBooking.findFirst({
      where: {
        therapistId,
        scheduledAt,
        status: 'scheduled',
      },
    });

    if (existingBooking) {
      throw new Error('Slot not available');
    }

    // Get therapist rate
    const therapist = await this.prisma.therapist.findUnique({
      where: { id: therapistId },
    });

    if (!therapist) {
      throw new Error('Therapist not found');
    }

    // Calculate price
    const price = (therapist.hourlyRate / 60) * duration;

    // Create booking
    const booking = await this.prisma.therapyBooking.create({
      data: {
        userId,
        therapistId,
        scheduledAt,
        duration,
        price,
        status: 'scheduled',
      },
    });

    return booking;
  }

  async getBookings(userId: string) {
    return this.prisma.therapyBooking.findMany({
      where: { userId },
      include: {
        therapist: {
          include: { user: true },
        },
      },
      orderBy: { scheduledAt: 'desc' },
    });
  }

  async cancelBooking(bookingId: string, reason?: string) {
    return this.prisma.therapyBooking.update({
      where: { id: bookingId },
      data: {
        status: 'cancelled',
        cancelledAt: new Date(),
        cancelReason: reason,
      },
    });
  }
}
```

### Week 5-6 Testing Checklist

```
✅ Therapist search working
✅ Filtering by specialization working
✅ Availability calendar working
✅ Booking creation working
✅ Payment processing working
✅ Booking confirmation email sent
✅ Booking cancellation working
✅ Booking list displays correctly
```

---

## WEEK 7-8: CRISIS MANAGEMENT & ADVANCED FEATURES

### Goals
- Crisis hotline integration
- Emergency contact alerts
- Session recording setup
- Progress tracking dashboard

### Crisis Hotline Integration

```typescript
// /src/services/crisisHotlineService.ts
import { PrismaClient } from '@prisma/client';
import { TwilioService } from './twilioService';

export class CrisisHotlineService {
  constructor(
    private prisma: PrismaClient,
    private twilioService: TwilioService,
  ) {}

  async handleCrisisAlert(userId: string, level: 'high' | 'medium', content: string) {
    // 1. Create crisis incident record
    const incident = await this.prisma.crisisIncident.create({
      data: {
        userId,
        level,
        content,
        status: 'active',
      },
    });

    // 2. Alert emergency contacts
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { emergencyContacts: true },
    });

    if (user?.emergencyContacts) {
      for (const contact of user.emergencyContacts) {
        if (contact.alertOnCrisis) {
          await this.twilioService.sendSMS(
            contact.phoneNumber,
            `${user.name} may need help. SAANS crisis team is responding.`,
          );
        }
      }
    }

    // 3. If HIGH LEVEL: immediate intervention
    if (level === 'high') {
      // Queue for immediate human review
      await this.escalateToHotlineTeam(incident.id, userId);
    } else if (level === 'medium') {
      // Schedule therapist follow-up
      await this.scheduleTherapistFollowup(userId, incident.id);
    }

    return incident;
  }

  private async escalateToHotlineTeam(incidentId: string, userId: string) {
    // In production, this would trigger:
    // 1. Alert to crisis counselor on duty
    // 2. Call or video intervention
    // 3. Emergency services coordination

    console.log(`Crisis escalated: Incident ${incidentId} for user ${userId}`);

    // For MVP: Send to queue for manual review
    // In real implementation: Use Twilio for calls
  }

  private async scheduleTherapistFollowup(userId: string, incidentId: string) {
    // Find available therapist
    const therapist = await this.getAvailableTherapist();

    if (therapist) {
      // Schedule follow-up within 24 hours
      const followupDate = new Date(Date.now() + 24 * 60 * 60 * 1000);

      await this.prisma.therapyBooking.create({
        data: {
          userId,
          therapistId: therapist.id,
          scheduledAt: followupDate,
          duration: 30,
          price: 0, // Free follow-up
          status: 'scheduled',
          notes: `Follow-up from crisis incident ${incidentId}`,
        },
      });
    }
  }

  private async getAvailableTherapist() {
    return this.prisma.therapist.findFirst({
      where: { isAvailable: true },
      orderBy: { averageRating: 'desc' },
    });
  }
}
```

### Progress Tracking Dashboard

```typescript
// /src/components/dashboard/ProgressDashboard.tsx
import React from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { useSelector } from 'react-redux';

export const ProgressDashboard: React.FC = () => {
  const { moodHistory } = useSelector((state) => state.mood);

  const moodTrend = transformMoodData(moodHistory);
  const weeklyStats = calculateWeeklyStats(moodHistory);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
      {/* Mood Trend */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Mood Trend (Last 30 days)</h3>
        <LineChart width={400} height={300} data={moodTrend}>
          <CartesianGrid />
          <XAxis dataKey="date" />
          <YAxis domain={[0, 10]} />
          <Tooltip />
          <Line type="monotone" dataKey="mood" stroke="#3b82f6" />
        </LineChart>
      </div>

      {/* Weekly Stats */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Weekly Breakdown</h3>
        <BarChart width={400} height={300} data={weeklyStats}>
          <CartesianGrid />
          <XAxis dataKey="day" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="avgMood" fill="#10b981" />
        </BarChart>
      </div>

      {/* Mental Health Score */}
      <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
        <h3 className="text-lg font-semibold mb-2">Mental Health Score</h3>
        <div className="text-4xl font-bold mb-2">7.2/10</div>
        <p className="text-blue-100">↑ 0.5 from last week</p>
        <div className="mt-4 space-y-2 text-sm">
          <p>✓ Regular therapy sessions</p>
          <p>✓ Improved sleep patterns</p>
          <p>✓ Reduced anxiety episodes</p>
        </div>
      </div>

      {/* Goals */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Your Goals</h3>
        <div className="space-y-3">
          <GoalCard title="Reduce Anxiety" progress={65} target="100 days without panic" />
          <GoalCard title="Better Sleep" progress={45} target="8 hours/night" />
          <GoalCard title="Daily Meditation" progress={80} target="30 min/day" />
        </div>
      </div>
    </div>
  );
};

interface GoalCardProps {
  title: string;
  progress: number;
  target: string;
}

const GoalCard: React.FC<GoalCardProps> = ({ title, progress, target }) => (
  <div>
    <div className="flex justify-between mb-2">
      <h4 className="font-medium">{title}</h4>
      <span className="text-sm text-gray-600">{progress}%</span>
    </div>
    <div className="w-full bg-gray-200 rounded-full h-2">
      <div
        className="bg-green-500 h-2 rounded-full"
        style={{ width: `${progress}%` }}
      />
    </div>
    <p className="text-xs text-gray-600 mt-1">{target}</p>
  </div>
);
```

### Week 7-8 Testing Checklist

```
✅ Crisis detection working
✅ Emergency alerts sent
✅ Crisis hotline flow working
✅ Therapist follow-up scheduled
✅ Progress dashboard displaying
✅ Mood trends calculated correctly
✅ Goals feature working
✅ Session recordings setup
```

---

## WEEK 9-10: TESTING, OPTIMIZATION & LAUNCH

### Comprehensive Testing

```typescript
// /src/__tests__/chat.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { AICounselorService } from '@/services/aiCounselorService';

describe('AI Counselor Service', () => {
  let service: AICounselorService;

  beforeEach(() => {
    service = new AICounselorService();
  });

  it('should detect high-level crisis', async () => {
    const crisisMessage = 'I want to end it all, I cannot take this anymore';
    const result = await service.generateResponse('conv-1', 'user-1', crisisMessage);

    expect(result.requiresFollowup).toBe(true);
    expect(result.topics).toContain('crisis');
  });

  it('should generate empathetic response', async () => {
    const message = 'I have been feeling anxious lately';
    const result = await service.generateResponse('conv-1', 'user-1', message);

    expect(result.content).toBeTruthy();
    expect(result.content.length).toBeGreaterThan(100);
  });

  it('should extract mood correctly', async () => {
    const sadMessage = 'I feel very sad and down';
    const result = await service.generateResponse('conv-1', 'user-1', sadMessage);

    expect(result.detectedMood).toBe('sad');
  });
});
```

### Performance Optimization

```typescript
// Optimize database queries
// Add indexes to frequently queried columns
// Implement pagination for large datasets
// Add caching for therapist profiles
// Optimize image serving (WebP, responsive sizes)
// Minimize bundle size (code splitting)
```

### Security Audit Checklist

```
┌─ AUTHENTICATION & AUTHORIZATION
│  ✅ JWT tokens secure
│  ✅ Password hashing (bcrypt, 12 rounds)
│  ✅ HTTPS enforced
│  ✅ CORS configured properly
│  ✅ Role-based access control working
│
├─ DATA PROTECTION
│  ✅ Sensitive data encrypted at rest
│  ✅ Encryption in transit (TLS)
│  ✅ No secrets in code/env files
│  ✅ SQL injection prevention (Prisma)
│  ✅ XSS protection (input sanitization)
│
├─ API SECURITY
│  ✅ Rate limiting enabled (100 req/min)
│  ✅ Input validation on all endpoints
│  ✅ CSRF protection
│  ✅ Request size limits
│  ✅ Error messages don't leak info
│
└─ INFRASTRUCTURE
   ✅ Security headers set
   ✅ Dependency vulnerabilities checked
   ✅ Docker images scanned
   ✅ Environment variables secured
   ✅ Backups automated & tested
```

### Deployment Checklist

```
PRE-DEPLOYMENT:
├─ All tests passing ✅
├─ Security audit complete ✅
├─ Performance metrics acceptable ✅
├─ Database migrations tested ✅
├─ Environment variables configured ✅
├─ Monitoring & alerting setup ✅
├─ Backup procedures verified ✅
└─ Rollback plan documented ✅

DEPLOYMENT:
├─ Blue-green deployment strategy ✅
├─ Database migration execution ✅
├─ Service healthcheck ✅
├─ Smoke tests passing ✅
├─ User notifications sent ✅
└─ Post-deployment monitoring active ✅

POST-DEPLOYMENT:
├─ Error rates normal ✅
├─ Response times acceptable ✅
├─ Database performance good ✅
├─ No critical issues ✅
└─ Beta testers onboarded ✅
```

### Week 9-10 Testing Checklist

```
FRONTEND:
✅ All pages load correctly
✅ Responsive on mobile/tablet
✅ Dark mode working
✅ Accessibility compliance (WCAG 2.1)
✅ All forms validate correctly
✅ Error handling working
✅ Loading states showing

BACKEND:
✅ All API endpoints tested
✅ Database queries optimized
✅ Error handling comprehensive
✅ Rate limiting working
✅ Authentication secure
✅ WebSocket stable
✅ Logging working

INTEGRATION:
✅ Frontend-backend communication
✅ Real-time features working
✅ Payment integration working
✅ Email notifications sending
✅ Socket.io stable under load
✅ Therapist matching working
✅ Crisis detection accurate

PERFORMANCE:
✅ Page load time < 2 seconds
✅ API response time < 200ms
✅ Database queries < 50ms
✅ Cache hit rate > 70%
✅ Mobile performance good
```

---

# LAUNCH STRATEGY

## Beta Launch (Week 9)

```
TARGET USERS:
├─ 500 beta testers (friends, student groups)
├─ 20 therapist partners
├─ Internal team (dogfooding)
└─ Mental health advocates

FEEDBACK COLLECTION:
├─ In-app feedback form
├─ Weekly survey
├─ 1-on-1 interviews (20 users)
├─ Therapist feedback
└─ Analytics tracking

METRICS TO MONITOR:
├─ User retention (Day 1, 7, 30)
├─ Chat engagement (avg messages/user)
├─ Therapist booking rate
├─ Crisis detection accuracy
├─ App crash rate
├─ Payment success rate
└─ User satisfaction (NPS)
```

## Public Launch (Week 10+)

```
LAUNCH ACTIVITIES:
├─ Press release to tech media
├─ Social media campaign (Instagram, Twitter)
├─ Mental health community outreach
├─ University partnerships
├─ Corporate B2B outreach
├─ Influencer collaboration
└─ Product Hunt launch

EXPECTED METRICS (Month 1):
├─ 1,000+ downloads
├─ 300+ active users
├─ 50+ therapist signups
├─ ₹50,000+ revenue
├─ 4.5+/5 app rating
└─ Positive media coverage

EXPECTED METRICS (Month 3):
├─ 10,000+ active users
├─ 150+ therapists
├─ ₹5+ lakh revenue
├─ Featured in app stores
└─ ₹50+ lakh in funding (Series A discussions)
```

---

# TEAM & RESPONSIBILITIES

```
FULL-STACK DEVELOPERS (2 people):
├─ Developer 1: Frontend (Chat, Dashboard, Booking)
├─ Developer 2: Backend (APIs, Services, Integrations)
└─ Both: Pair programming for complex features

DATABASE/DEVOPS ENGINEER (1 person):
├─ Database design & optimization
├─ Infrastructure setup
├─ CI/CD pipeline
├─ Monitoring & alerting
└─ Backup & disaster recovery

AI/ML ENGINEER (1 person):
├─ AI counselor implementation
├─ Crisis detection algorithm
├─ Mood analysis
├─ NLP model training
└─ Response quality improvement

QA/TESTING ENGINEER (1 person):
├─ Test automation
├─ Manual testing
├─ Performance testing
├─ Security testing
└─ Bug reporting & tracking
```

---

# SUCCESS CRITERIA FOR LAUNCH

```
FUNCTIONAL REQUIREMENTS:
✅ User registration & authentication working
✅ AI counselor responding within 2 seconds
✅ Real-time chat without lag
✅ Therapist booking & scheduling working
✅ Payment processing successful
✅ Crisis detection accurate (>95%)
✅ Email notifications sending
✅ Progress tracking displaying correctly

PERFORMANCE REQUIREMENTS:
✅ Page load time < 2 seconds
✅ API response time < 200ms
✅ Mobile app responsive
✅ Zero critical bugs
✅ Database queries optimized
✅ Cache hit rate > 70%

SECURITY REQUIREMENTS:
✅ HTTPS enabled
✅ JWT tokens secure
✅ Password hashing secure (bcrypt 12)
✅ HIPAA compliance ready
✅ No data breaches
✅ Security audit passed

USER EXPERIENCE REQUIREMENTS:
✅ Onboarding smooth (< 2 minutes)
✅ Dark mode available
✅ Mobile-first design
✅ Accessibility compliant (WCAG 2.1)
✅ User rating 4.5+/5
✅ NPS score > 50
```

---

# TIMELINE SUMMARY

```
Week 1:    Project setup & infrastructure         ✓
Week 2:    Authentication & user management       ✓
Week 3-4:  AI counselor & chat system             ✓
Week 5-6:  Therapist marketplace & booking        ✓
Week 7-8:  Crisis management & advanced features ✓
Week 9-10: Testing, optimization & launch        ✓

Total: 8-10 weeks to MVP

September 2026: Development sprint
October 2026: Beta testing & refinement
November 2026: Public launch 🚀
```

---

**NEXT STEPS:**

1. ✅ Read SYSTEM_DESIGN.md (complete architecture)
2. ✅ Read DATABASE_SCHEMA.md (data model)
3. ✅ Read API_SPECIFICATIONS.md (all endpoints)
4. → Follow this roadmap week-by-week
5. → Track progress in GitHub Issues
6. → Ship to production! 🎉

---

Jo samajhna h, pooch! Ab build karte hain! 💪
