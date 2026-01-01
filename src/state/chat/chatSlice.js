import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    messages: [],
    people: [], // list trả về từ GET_USER_LIST: [{ name, type, actionTime }, ...]
    activeChat: null, // { name, type } | null
};

const chatSlice = createSlice({
    name: "chat",
    initialState,
    reducers: {
        setPeople(state, action) {
            state.people = action.payload ?? [];
        },
        setActiveChat(state, action) {
            state.activeChat = action.payload ?? null;
        },
        setMessages(state, action) {
            state.messages = action.payload;
        },
        addMessage(state, action) {
            state.messages.push(action.payload);
        },
        clearMessages(state) {
            state.messages = [];
            state.people = [];
            state.activeChat = null;
        },
    },
});

export const { setPeople, setActiveChat, setMessages, addMessage, clearChat } = chatSlice.actions;
export default chatSlice.reducer;
