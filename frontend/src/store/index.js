import { configureStore } from '@reduxjs/toolkit'
import authReducer from './authSlice'
import uiReducer from './uiSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
})

export default store