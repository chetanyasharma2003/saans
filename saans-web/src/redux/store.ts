import { configureStore } from '@reduxjs/toolkit';
import authReducer, { type AuthState } from './slices/authSlice';
import chatReducer, { type ChatState } from './slices/chatSlice';
import moodReducer, { type MoodState } from './slices/moodSlice';
import therapyReducer, { type TherapyState } from './slices/therapySlice';
import notificationsReducer, { type NotificationsState } from './slices/notificationsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    chat: chatReducer,
    mood: moodReducer,
    therapy: therapyReducer,
    notifications: notificationsReducer,
  },
});

export type RootState = {
  auth: AuthState;
  chat: ChatState;
  mood: MoodState;
  therapy: TherapyState;
  notifications: NotificationsState;
};
export type AppDispatch = typeof store.dispatch;

export default store;
