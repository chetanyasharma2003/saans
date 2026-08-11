import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface MoodEntry {
  date: Date;
  score: number;
  category: string;
}

export interface MoodState {
  todayMood: MoodEntry | null;
  moodHistory: MoodEntry[];
  isLoading: boolean;
}

const initialState: MoodState = {
  todayMood: null,
  moodHistory: [],
  isLoading: false,
};

const moodSlice = createSlice({
  name: 'mood',
  initialState,
  reducers: {
    addMoodEntry: (state, action: PayloadAction<MoodEntry>) => {
      state.todayMood = action.payload;
      state.moodHistory.push(action.payload);
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
  },
});

export const { addMoodEntry, setLoading } = moodSlice.actions;
export default moodSlice.reducer;
