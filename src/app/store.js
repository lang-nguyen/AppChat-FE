import { configureStore } from "@reduxjs/toolkit";
import chatReducer from "../state/chat/chatSlice";
import authReducer from "../state/auth/authSlice";

export const store = configureStore({
    reducer: {
        auth: authReducer,
        chat: chatReducer,
    },
});