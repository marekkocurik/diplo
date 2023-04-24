import { combineReducers, configureStore } from '@reduxjs/toolkit';
import exerciseSlice from './slices/exerciseSlice';

const reducer = combineReducers({
  exercise: exerciseSlice,
});

export default configureStore({
  reducer,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware(),
});
