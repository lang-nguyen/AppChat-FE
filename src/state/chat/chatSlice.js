import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    messages: [],
    people: [], // list trả về từ GET_USER_LIST: [{ name, type, actionTime }, ...]
    activeChat: null, // { name, type } | null
    onlineStatus: {}, // { username: boolean }
    hasMore: true, // Trạng thái còn dữ liệu để load hay không
    pendingPage: 1, // Page number đang được fetch
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
                    // Tin nhắn 1-1: Kiểm tra cả hai chiều (tôi gửi cho người đó, hoặc người đó gửi cho tôi)
                    const currentUser = localStorage.getItem('user_name');
                    if (
                        (newMessage.name === currentUser && newMessage.to === activeChat.name) ||
                        (newMessage.name === activeChat.name && newMessage.to === currentUser)
                    ) {
                        isRelevant = true;
                    }
                } else {
                    // Tin nhắn nhóm: Chỉ cần kiểm tra tên phòng
                    if (activeChat.name === newMessage.to) {
                        isRelevant = true;
                    }
                }
            }

            // Chỉ thêm tin nhắn nếu nó thuộc phòng đang mở và chưa tồn tại
            if (isRelevant) {
                // Kiểm tra trùng lặp (tránh thêm tin nhắn 2 lần)
                const isDuplicate = state.messages.some(m => 
                    m.createAt === newMessage.createAt && 
                    m.name === newMessage.name && 
                    m.mes === newMessage.mes
                );
                
                if (!isDuplicate) {
                    state.messages.push(newMessage);
                }
            }

            // 2. Cập nhật Sidebar (People List)
            const targetName = newMessage.to || newMessage.name;
            const index = state.people.findIndex(p => p.name === targetName);
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

            // Validate page number
            const validPage = typeof page === 'number' && page > 0 ? page : 1;

            // Đảo ngược để có thứ tự: Cũ nhất -> Mới nhất
            const processedMessages = [...newMessages].reverse();

            if (validPage === 1) {
                // Trang đầu tiên: thay thế toàn bộ
                state.messages = processedMessages;
            } else if (newMessages.length > 0) {
                // Trang > 1 và có data: thêm vào đầu
                state.messages = [...processedMessages, ...state.messages];
            }

            // Nếu server trả về mảng rỗng → Hết dữ liệu
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
        setPendingPage(state, action) {
            state.pendingPage = action.payload;
        },
    },
});

export const {
    setPeople, setActiveChat, setMessages, addMessage,
    setChatHistory, clearChat, setOnlineStatus, clearMessages, setPendingPage
} = chatSlice.actions;

export default chatSlice.reducer;
