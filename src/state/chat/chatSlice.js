import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    messages: [],
    people: [], // list trả về từ GET_USER_LIST: [{ name, type, actionTime }, ...]
    activeChat: null, // { name, type } | null
    onlineStatus: {}, // { username: boolean }
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
        },
        setMessages(state, action) {
            state.messages = action.payload;
        },
        addMessage(state, action) {
            const newMessage = action.payload;
            const { activeChat } = state;

            // 1. Nếu đang mở chat với người gửi (hoặc phòng nhận), thêm vào danh sách messages
            let isRelevant = false;
            if (activeChat) {
                // Nếu là chat 1-1: check nếu tin nhắn đến từ người đang chat HOẶC mình gửi cho họ
                if (activeChat.type === 0 || activeChat.type === 'people') {
                    if (newMessage.name === activeChat.name || newMessage.to === activeChat.name) {
                        isRelevant = true;
                    }
                }
                // Nếu là chat nhóm: check nếu tin nhắn gửi đến phòng đang mở
                else if (activeChat.name === newMessage.to) {
                    isRelevant = true;
                }
            }

            if (isRelevant) {
                state.messages.push(newMessage);
            }

            // 2. Cập nhật Sidebar (People List) để hiển thị tin nhắn mới nhất
            // Tìm người/phòng trong danh sách
            const targetName = newMessage.to === 'room' ? newMessage.to : (newMessage.name === state.user?.username ? newMessage.to : newMessage.name);
            // Tạm thời chỉ cập nhật nếu tìm thấy name trong people matching với Sender hoặc Receiver

            const index = state.people.findIndex(p => p.name === newMessage.name || p.name === newMessage.to);
            if (index !== -1) {
                // Di chuyển lên đầu danh sách (optional) hoặc cập nhật actionTime
                const item = state.people[index];
                item.actionTime = newMessage.createAt || new Date().toISOString();
                // Xoá vị trí cũ và đưa lên đầu
                state.people.splice(index, 1);
                state.people.unshift(item);
            }
        },
        setChatHistory(state, action) {
            const { messages, page } = action.payload;
            if (page === 1) {
                state.messages = messages;
            } else {
                state.messages = [...messages, ...state.messages];
            }
        },
        clearMessages(state) {
            state.messages = [];
        },
        clearMessages(state) {
            state.messages = [];
            state.activeChat = null;
        },
    },
});

export const { setPeople, setActiveChat, setMessages, addMessage, setChatHistory, clearChat, setOnlineStatus, clearMessages } = chatSlice.actions;
export default chatSlice.reducer;
