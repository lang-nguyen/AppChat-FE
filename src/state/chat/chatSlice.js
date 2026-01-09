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
        addMessage(state, action) {
            const newMessage = action.payload;
            const { activeChat } = state;
            const currentUserName =
                newMessage._currentUser?.name ||
                newMessage._currentUser?.user ||
                newMessage._currentUser?.username ||
                localStorage.getItem('user_name') ||
                '';

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
                } else if (activeChat.type === 1 || activeChat.type === 'room') {
                    // Tin nhắn nhóm: Kiểm tra type và tên phòng
                    if (newMessage.to === activeChat.name) {
                        isRelevant = true;
                    }
                }
            }

            // Chỉ thêm tin nhắn nếu nó thuộc phòng đang mở và chưa tồn tại
            if (isRelevant) {
                const isDuplicate = state.messages.some(m =>
                    m.createAt === newMessage.createAt &&
                    m.name === newMessage.name &&
                    m.mes === newMessage.mes
                );

                if (!isDuplicate) {
                    state.messages.push(newMessage);
                }
            }

            // 2. Cập nhật Sidebar (People List) để hiển thị tin nhắn mới nhất
            let targetName = null;
            let targetType = null;

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
    setPeople, setActiveChat, setMessages, addMessage,
    setChatHistory, clearChat, setOnlineStatus, clearMessages,
    setPendingRoomCreation, clearPendingRoomCreation,
    setPendingPage, updateRoomData, setPendingConversations, removePendingConversation
} = chatSlice.actions;

export default chatSlice.reducer;
