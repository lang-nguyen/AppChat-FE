import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    messages: [],
    people: [], // list trả về từ GET_USER_LIST: [{ name, type, actionTime }, ...]
    activeChat: null, // { name, type } | null
    onlineStatus: {}, // { username: boolean }
    hasMore: true, // Trạng thái còn dữ liệu để load hay không
};

const chatSlice = createSlice({
    name: "chat",
    initialState,
    reducers: {
        setPeople(state, action) {
            state.people = action.payload ?? [];
        },
        setOnlineStatus(state, action) {
            const { user, isOnline } = action.payload;
            state.onlineStatus[user] = isOnline;
        },
        setActiveChat(state, action) {
            state.activeChat = action.payload ?? null;
            state.hasMore = true; // Reset hasMore khi đổi chat
        },
        setMessages(state, action) {
            state.messages = action.payload;
        },
        addMessage(state, action) {
            const newMessage = action.payload;
            const { activeChat } = state;

            // 1. Kiểm tra tin nhắn có thuộc phòng đang mở hay không
            let isRelevant = false;
            if (activeChat) {
                if (activeChat.type === 0 || activeChat.type === 'people') {
                    if (newMessage.name === activeChat.name || newMessage.to === activeChat.name) {
                        isRelevant = true;
                    }
                } else if (activeChat.name === newMessage.to) {
                    isRelevant = true;
                }
            }

            if (isRelevant) {
                state.messages.push(newMessage);
            }

            // 2. Cập nhật Sidebar (People List)
            const index = state.people.findIndex(p => p.name === newMessage.name || p.name === newMessage.to);
            if (index !== -1) {
                const item = state.people[index];
                item.actionTime = newMessage.createAt || new Date().toISOString();
                state.people.splice(index, 1);
                state.people.unshift(item);
            }
        },
        setChatHistory(state, action) {
            const { messages, page } = action.payload;
            const newMessages = Array.isArray(messages) ? messages : [];

            // Đảo ngược để có thứ tự: Cũ nhất -> Mới nhất
            const processedMessages = [...newMessages].reverse();

            if (page === 1) {
                state.messages = processedMessages;
            } else if (newMessages.length > 0) {
                state.messages = [...processedMessages, ...state.messages];
            }

            // Nếu server trả về mảng rỗng -> Hết dữ liệu
            if (newMessages.length === 0) {
                state.hasMore = false;
            }
        },
        clearMessages(state) {
            state.messages = [];
        },
        clearChat(state) {
            state.messages = [];
            state.activeChat = null;
        },
    },
});

export const {
    setPeople, setActiveChat, setMessages, addMessage,
    setChatHistory, clearChat, setOnlineStatus, clearMessages
} = chatSlice.actions;

export default chatSlice.reducer;
