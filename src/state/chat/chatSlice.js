import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    messages: [],
    people: [], // list trả về từ GET_USER_LIST: [{ name, type, actionTime }, ...]
    activeChat: null, // { name, type } | null
    onlineStatus: {}, // { username: boolean }
    pendingRoomCreation: null, // { roomName, selectedUsers, currentUserName } | null - Lưu thông tin tạo nhóm đang chờ
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
            // Xác định target (người/phòng cần cập nhật trong danh sách)
            let targetName = null;
            let targetType = null;
            
            // Lấy tên user hiện tại để so sánh
            const currentUserName = state.user?.name || state.user?.user || state.user?.username || '';
            
            if (newMessage.type === 'room' || newMessage.to === 'room') {
                // Chat nhóm: target là tên phòng
                targetName = newMessage.to;
                targetType = 1; // type 1 = group
            } else {
                // Chat 1-1: target là người đối diện (không phải mình)
                if (newMessage.name === currentUserName) {
                    // Mình gửi → target là người nhận
                    targetName = newMessage.to;
                    targetType = 0; // type 0 = people
                } else {
                    // Người khác gửi → target là người gửi
                    targetName = newMessage.name;
                    targetType = 0; // type 0 = people
                }
            }
            
            // Tìm trong danh sách
            if (targetName) {
                const index = state.people.findIndex(p => p.name === targetName);
                
                if (index !== -1) {
                    // Đã có: Cập nhật actionTime, lastMessage và di chuyển lên đầu
                    const item = state.people[index];
                    item.actionTime = newMessage.createAt || new Date().toISOString();
                    item.lastMessage = newMessage.mes || newMessage.text || '';
                    state.people.splice(index, 1);
                    state.people.unshift(item);
                } else {
                    // Chưa có: Thêm vào đầu danh sách
                    const newItem = {
                        name: targetName,
                        type: targetType,
                        actionTime: newMessage.createAt || new Date().toISOString(),
                        lastMessage: newMessage.mes || newMessage.text || ''
                    };
                    state.people.unshift(newItem);
                }
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
        clearChat(state) {
            state.messages = [];
            state.activeChat = null;
        },
        setPendingRoomCreation(state, action) {
            state.pendingRoomCreation = action.payload;
        },
        clearPendingRoomCreation(state) {
            state.pendingRoomCreation = null;
        },
    },
});

export const { setPeople, setActiveChat, setMessages, addMessage, setChatHistory, clearChat, setOnlineStatus, clearMessages, setPendingRoomCreation, clearPendingRoomCreation } = chatSlice.actions;
export default chatSlice.reducer;
