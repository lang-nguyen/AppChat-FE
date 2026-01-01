import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    messages: [], // Danh sách tin nhắn
    people: [],   // Danh sách user online
    checkUserResult: null, // Kết quả kiểm tra user
};

const chatSlice = createSlice({
    name: "chat",
    initialState,
    reducers: {
        setMessages(state, action) {
            state.messages = action.payload;
        },
        addMessage(state, action) {
            state.messages.push(action.payload);
        },
        clearMessages(state) {
            state.messages = [];
        },
        setPeople(state, action) {
            state.people = action.payload;
        },
        setCheckUserResult(state, action) {
            state.checkUserResult = action.payload;
        },
    },
});

export const { setMessages, addMessage, clearMessages, setPeople, setCheckUserResult } = chatSlice.actions;
export default chatSlice.reducer;
