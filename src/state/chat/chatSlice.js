import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    messages: [],
    people: [], // list trả về từ GET_USER_LIST: [{ name, type, actionTime, lastMessage }, ...]
    activeChat: null, // { name, type } | null
    onlineStatus: {}, // { username: boolean }
    pendingRoomCreation: null, // { roomName, selectedUsers, currentUserName } | null - Lưu thông tin tạo nhóm đang chờ
    hasMore: true, // Trạng thái còn dữ liệu để load hay không
    pendingPage: 1, // Page number đang được fetch
    pendingConversations: [], // Danh sách pending contact requests: [{ username, status, createdAt }, ...]
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
        upsertMessage(state, action) {
            const newMessage = action.payload;
            const { activeChat, messages } = state;

            // 1. Kiểm tra tin nhắn có thuộc phòng đang mở hay không
            let isRelevant = false;
            if (activeChat) {
                const isActiveChatRoom = activeChat.type === 1 || activeChat.type === 'room';
                const isActiveChatPeople = activeChat.type === 0 || activeChat.type === 'people';
                const isMsgRoom = newMessage.type === 'room' || newMessage.type === 1;

                if (isActiveChatPeople && !isMsgRoom) {
                    if (newMessage.to === activeChat.name || newMessage.name === activeChat.name) isRelevant = true;
                } else if (isActiveChatRoom && isMsgRoom) {
                    if (newMessage.to === activeChat.name) isRelevant = true;
                }
            }

            if (!isRelevant) return;

            // 2. Xử lý Trùng lặp & Optimistic UI
            const isDuplicate = messages.some(m =>
                (newMessage.tempId && m.tempId === newMessage.tempId) ||
                (m.createAt === newMessage.createAt && m.name === newMessage.name && m.mes === newMessage.mes)
            );

            const optimisticIndex = messages.findIndex(m =>
                m.tempId && m.name === newMessage.name && m.mes === newMessage.mes
            );

            if (optimisticIndex !== -1) {
                state.messages[optimisticIndex] = newMessage;
            } else if (!isDuplicate) {
                state.messages.push(newMessage);
            }
        },

        updateSidebar(state, action) {
            const newMessage = action.payload;
            const currentUserName = localStorage.getItem('user_name') || '';

            let targetName = null;
            let targetType = null;

            if (newMessage.type === 'room' || newMessage.type === 1) {
                targetName = newMessage.to;
                targetType = 1;
            } else {
                targetName = newMessage.name === currentUserName ? newMessage.to : newMessage.name;
                targetType = 0;
            }

            if (!targetName) return;

            const index = state.people.findIndex(p => p.name === targetName);
            const updateData = {
                actionTime: newMessage.createAt || new Date().toISOString(),
                lastMessage: newMessage.mes || newMessage.text || ''
            };

            if (index !== -1) {
                const item = { ...state.people[index], ...updateData };
                state.people.splice(index, 1);
                state.people.unshift(item);
            } else {
                state.people.unshift({
                    name: targetName,
                    type: targetType,
                    ...updateData,
                    isOnline: false
                });
            }
        },
        // addMessage remains for backward compatibility, but calls the specialized reducers
        addMessage(state, action) {
            chatSlice.caseReducers.upsertMessage(state, action);
            chatSlice.caseReducers.updateSidebar(state, action);
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
        setPendingRoomCreation(state, action) {
            state.pendingRoomCreation = action.payload;
        },
        clearPendingRoomCreation(state) {
            state.pendingRoomCreation = null;
        },
        setPendingPage(state, action) {
            state.pendingPage = action.payload;
        },
        updateRoomData(state, action) {
            const { name, userList = [], own } = action.payload;

            // Hợp nhất own vào userList nếu chưa có
            let finalUserList = [...userList];
            if (own) {
                const ownerExists = finalUserList.some(u =>
                    (typeof u === 'string' ? u : u.name) === own
                );
                if (!ownerExists) {
                    finalUserList.unshift({ name: own, isOwner: true });
                }
            }

            const index = state.people.findIndex(p => p.name === name && p.type === 1);
            if (index !== -1) {
                state.people[index].userList = finalUserList;
                state.people[index].own = own;
            } else {
                state.people.unshift({
                    name,
                    type: 1,
                    userList: finalUserList,
                    own,
                    actionTime: new Date().toISOString()
                });
            }
        },
        setPendingConversations(state, action) {
            state.pendingConversations = action.payload ?? [];
        },
        removePendingConversation(state, action) {
            const { username } = action.payload;
            state.pendingConversations = state.pendingConversations.filter(
                p => p.username !== username && p.name !== username
            );
        },
    },
});

export const {
    setPeople, setActiveChat, setMessages, addMessage, upsertMessage, updateSidebar,
    setChatHistory, clearChat, setOnlineStatus, clearMessages,
    setPendingRoomCreation, clearPendingRoomCreation,
    setPendingPage, updateRoomData, setPendingConversations, removePendingConversation
} = chatSlice.actions;

export default chatSlice.reducer;
