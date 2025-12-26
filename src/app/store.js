// src/app/store.js
import { configureStore } from '@reduxjs/toolkit';
import chatReducer from '../state/chat/chatSlice';

// Tạo store (kho chứa state toàn cục)
export const store = configureStore({
  reducer: {
    chat: chatReducer,  // chat = tên "ngăn" trong store
  },
});