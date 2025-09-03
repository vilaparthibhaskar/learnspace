import { configureStore } from '@reduxjs/toolkit';
import userReducer from './slices/userSlice';
import classesReducer from './slices/classesSlice';
import submissionsReducer from './slices/submissionsSlice';
import alertsReducer from './slices/alertsSlice';

const store = configureStore({
  reducer: {
    user: userReducer,
    classes: classesReducer,
    submissions: submissionsReducer,
    alerts: alertsReducer,
  },
});

export default store;