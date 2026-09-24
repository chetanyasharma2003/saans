# SAANS Mobile App - React Native

## 📱 App Architecture

### **Setup Commands**
```bash
npx create-expo-app saans-mobile
cd saans-mobile
npm install

# Essential packages
npm install @react-navigation/native @react-navigation/bottom-tabs
npm install @react-native-async-storage/async-storage
npm install axios react-query
npm install react-native-agora agora-react-native-rtc
npm install react-native-stripe-sdk
npm install react-native-razorpay
npm install @react-native-firebase/app @react-native-firebase/messaging
npm install react-native-geolocation-service react-native-maps
npm install zustand
npm install expo-notifications
```

### **Project Structure**
```
saans-mobile/
├── app.json
├── App.tsx
├── src/
│   ├── screens/
│   │   ├── auth/
│   │   │   ├── LoginScreen.tsx
│   │   │   ├── RegisterScreen.tsx
│   │   │   └── OnboardingScreen.tsx
│   │   ├── home/
│   │   │   ├── DashboardScreen.tsx
│   │   │   ├── TherapistSearchScreen.tsx
│   │   │   └── AppointmentListScreen.tsx
│   │   ├── therapy/
│   │   │   ├── VideoCallScreen.tsx
│   │   │   ├── ChatScreen.tsx
│   │   │   └── SessionNotesScreen.tsx
│   │   ├── community/
│   │   │   ├── CommunityFeedScreen.tsx
│   │   │   ├── CreatePostScreen.tsx
│   │   │   └── CommunityGroupsScreen.tsx
│   │   ├── tracking/
│   │   │   ├── MoodTrackerScreen.tsx
│   │   │   ├── ProgressScreen.tsx
│   │   │   └── InsightsScreen.tsx
│   │   ├── payments/
│   │   │   ├── PaymentScreen.tsx
│   │   │   ├── SubscriptionScreen.tsx
│   │   │   └── BillingHistoryScreen.tsx
│   │   └── profile/
│   │       ├── ProfileScreen.tsx
│   │       ├── SettingsScreen.tsx
│   │       └── NotificationsScreen.tsx
│   ├── components/
│   │   ├── TherapistCard.tsx
│   │   ├── AppointmentCard.tsx
│   │   ├── MoodWidget.tsx
│   │   ├── VideoCallUI.tsx
│   │   ├── ChatBubble.tsx
│   │   └── LoadingSpinner.tsx
│   ├── navigation/
│   │   ├── RootNavigator.tsx
│   │   ├── AuthNavigator.tsx
│   │   ├── HomeNavigator.tsx
│   │   └── ProfileNavigator.tsx
│   ├── services/
│   │   ├── api.ts
│   │   ├── auth.ts
│   │   ├── payments.ts
│   │   ├── videocalls.ts
│   │   ├── notifications.ts
│   │   └── analytics.ts
│   ├── stores/
│   │   ├── authStore.ts
│   │   ├── userStore.ts
│   │   ├── appointmentStore.ts
│   │   └── moodStore.ts
│   ├── utils/
│   │   ├── constants.ts
│   │   ├── formatting.ts
│   │   └── validators.ts
│   ├── styles/
│   │   ├── theme.ts
│   │   └── colors.ts
│   └── hooks/
│       ├── useAuth.ts
│       ├── useAppointments.ts
│       └── useMood.ts
```

## 🎨 Key Screens

### **Authentication Flow**
- Login with email/phone
- Google/Apple OAuth
- OTP verification
- Biometric login

### **Home Dashboard**
- Quick stats (appointments, mood, subscriptions)
- Upcoming appointments
- Quick action buttons
- Recent activity feed

### **Therapist Search & Booking**
- Location-based search
- Filter by specialty/language/price
- Therapist profile view
- Real-time availability
- Instant booking

### **Video Therapy**
- HD video/audio
- Screen sharing
- Call recording
- In-call messaging
- Post-session notes

### **Mood Tracking**
- Daily mood check-in (1-5 scale)
- Activity logging
- Gratitude journal
- Progress graphs
- Mood triggers

### **Community**
- Social feed
- Create posts
- Upvote/comment
- Join groups
- Direct messaging

### **Subscription & Payments**
- Plan comparison
- Subscribe via Stripe/Razorpay
- Manage subscriptions
- View billing history
- Download invoices

## 🔐 Security Features

- Secure token storage (AsyncStorage with encryption)
- Biometric authentication
- SSL pinning
- Data encryption at rest
- Privacy policy integration

## 🚀 Push Notifications

- Appointment reminders
- Therapy session invites
- New messages
- Resource recommendations
- Crisis alerts

## 📊 Analytics Integration

- Session tracking
- User engagement
- Feature adoption
- Crash reporting
- Performance monitoring

## 🎯 Offline Support

- Cached data for offline access
- Offline mood logging
- Background sync
- Offline messaging queue

## 💾 Data Sync

- Real-time sync with backend
- Conflict resolution
- Partial sync support
- Network awareness

## 📱 Platform-Specific

**iOS:**
- App Store deployment
- Push notifications via APNs
- FaceID support
- Dark mode

**Android:**
- Google Play deployment
- Firebase Cloud Messaging
- Biometric unlock
- Material Design 3

## 🧪 Testing

```bash
# Unit tests
npm test

# E2E tests
npx detox build-framework-cache
npx detox test --cleanup

# Lint
npm run lint
```

## 📦 Build & Release

```bash
# Development build
eas build --platform android --profile preview
eas build --platform ios --profile preview

# Production build
eas build --platform android --profile production
eas build --platform ios --profile production

# Submit to stores
eas submit --platform android
eas submit --platform ios
```

## 🔗 API Integration

- All endpoints from Phase 1-5 available
- Real-time WebSocket for notifications
- Offline-first architecture
- GraphQL option for data efficiency

## 📈 Performance

- App size: < 100MB
- Startup time: < 2 seconds
- Video codec: H264 (iOS), VP8 (Android)
- Database: SQLite with encryption

## 🛠️ Development Tools

- Expo Go for live testing
- Redux DevTools
- React Query DevTools
- Network inspector
- Performance monitor

## 📚 Documentation

- User guide
- Developer docs
- API documentation
- Troubleshooting guide
