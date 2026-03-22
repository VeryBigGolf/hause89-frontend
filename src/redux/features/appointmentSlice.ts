import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Appointment } from '../../../interfaces';

type AppointmentState = {
  appointments: Appointment[];
  selectedShopId: string | null;
};

const initialState: AppointmentState = {
  appointments: [],
  selectedShopId: null,
};

export const appointmentSlice = createSlice({
  name: 'appointment',
  initialState,
  reducers: {
    setAppointments: (state, action: PayloadAction<Appointment[]>) => {
      state.appointments = action.payload;
    },
    addAppointment: (state, action: PayloadAction<Appointment>) => {
      state.appointments.push(action.payload);
    },
    removeAppointment: (state, action: PayloadAction<string>) => {
      state.appointments = state.appointments.filter(
        (appt) => appt._id !== action.payload
      );
    },
    updateAppointment: (state, action: PayloadAction<Appointment>) => {
      const index = state.appointments.findIndex(
        (appt) => appt._id === action.payload._id
      );
      if (index !== -1) {
        state.appointments[index] = action.payload;
      }
    },
    setSelectedShopId: (state, action: PayloadAction<string | null>) => {
      state.selectedShopId = action.payload;
    },
  },
});

export const {
  setAppointments,
  addAppointment,
  removeAppointment,
  updateAppointment,
  setSelectedShopId,
} = appointmentSlice.actions;

export default appointmentSlice.reducer;
