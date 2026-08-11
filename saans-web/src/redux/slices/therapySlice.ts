import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Therapist {
  id: string;
  name: string;
  specialization: string[];
  rating: number;
}

interface Booking {
  id: string;
  therapistId: string;
  date: Date;
  status: string;
}

export interface TherapyState {
  therapists: Therapist[];
  bookings: Booking[];
  isLoading: boolean;
}

const initialState: TherapyState = {
  therapists: [],
  bookings: [],
  isLoading: false,
};

const therapySlice = createSlice({
  name: 'therapy',
  initialState,
  reducers: {
    setTherapists: (state, action: PayloadAction<Therapist[]>) => {
      state.therapists = action.payload;
    },
    setBookings: (state, action: PayloadAction<Booking[]>) => {
      state.bookings = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
  },
});

export const { setTherapists, setBookings, setLoading } = therapySlice.actions;
export default therapySlice.reducer;
