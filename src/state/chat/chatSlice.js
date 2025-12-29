import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    messages: [],
    people: [],
};

const chatSlice = createSlice({
    name: "chat",
    initialState,
    reducers: {
        setPeople(state, action) {
            state.people = action.payload ?? [];
        },
        setMessages(state, action) {
            state.messages = action.payload ?? [];
        },
        addMessage(state, action) {
            state.messages.push(action.payload);
        },
        clearChat(state) {
            state.messages = [];
            state.people = [];
        },
    },
});

export const { setPeople, setMessages, addMessage, clearChat } = chatSlice.actions;
export default chatSlice.reducer;