import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'ai' | 'therapist';
  timestamp: Date;
  mood?: string;
}

export interface ChatState {
  currentChat: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  unreadCount: number;
}

const initialState: ChatState = {
  currentChat: [],
  isLoading: false,
  error: null,
  unreadCount: 0,
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    addMessage: (state, action: PayloadAction<ChatMessage>) => {
      state.currentChat.push(action.payload);
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const { addMessage, setLoading, setError, clearError } = chatSlice.actions;
export default chatSlice.reducer;
