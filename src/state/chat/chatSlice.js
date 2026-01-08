import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    messages: [],
    people: [], // list trả về từ GET_USER_LIST: [{ name, type, actionTime, lastMessage }, ...]
    activeChat: null, // { name, type } | null
    onlineStatus: {}, // { username: boolean }
    pendingRoomCreation: null, // { roomName, selectedUsers, currentUserName } | null - Lưu thông tin tạo nhóm đang chờ
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

            // Lấy tên người dùng hiện tại từ localStorage để đảm bảo nhất quán
            const currentUserName = localStorage.getItem('user_name') || '';

            // 1. Kiểm tra tin nhắn có thuộc phòng đang mở hay không để cập nhật UI ngay lập tức (SPA)
            let isRelevant = false;

            if (activeChat) {
                const isActiveChatRoom = activeChat.type === 1 || activeChat.type === 'room';
                const isActiveChatPeople = activeChat.type === 0 || activeChat.type === 'people';

                // Xác định loại tin nhắn dựa trên dữ liệu trả về
                // Đôi khi server trả về type='room' nhưng đôi khi chỉ có to='Group...'
                // Nên ưu tiên check type nếu có, hoặc suy luận từ ngữ cảnh
                const isMsgRoom = newMessage.type === 'room' || newMessage.type === 1;

                if (isActiveChatPeople && !isMsgRoom) {
                    // Chat 1-1:
                    // Case 1: Mình gửi cho họ (to === activeChat.name)
                    // Case 2: Họ gửi cho mình (name === activeChat.name)
                    if (newMessage.to === activeChat.name || newMessage.name === activeChat.name) {
                        isRelevant = true;
                    }
                } else if (isActiveChatRoom && isMsgRoom) {
                    // Chat nhóm: Chỉ cần kiểm tra tên phòng (to === activeChat.name)
                    if (newMessage.to === activeChat.name) {
                        isRelevant = true;
                    }
                }
            }

            // Chỉ thêm tin nhắn nếu nó thuộc phòng đang mở
            if (isRelevant) {
                // Kiểm tra trùng lặp (QUAN TRỌNG cho Optimistic UI)
                // 1. Trùng ID tạm (nếu có - do Client sinh ra)
                // 2. Trùng nội dung + thời gian + người gửi (cho các tin nhắn từ Server về)
                const isDuplicate = state.messages.some(m => {
                    if (newMessage.tempId && m.tempId === newMessage.tempId) return true;
                    return m.createAt === newMessage.createAt &&
                        m.name === newMessage.name &&
                        m.mes === newMessage.mes;
                });

                // Xử lý Optimistic UI:
                // Tìm tin nhắn tạm (có tempId) của chính mình khớp nội dung
                const optimisticIndex = state.messages.findIndex(m =>
                    m.tempId &&
                    m.name === newMessage.name &&
                    m.mes === newMessage.mes
                );

                if (optimisticIndex !== -1) {
                    // Tìm thấy tin nhắn tạm tương ứng -> Thay thế bằng tin thật từ Server
                    // Giữ lại createAt từ server để đảm bảo đồng bộ
                    state.messages[optimisticIndex] = newMessage;
                } else if (!isDuplicate) {
                    // Không tìm thấy tin tạm và không trùng -> Thêm mới vào danh sách
                    // SPA: Push trực tiếp vào mảng, Redux Toolkit (Immer) sẽ xử lý
                    state.messages.push(newMessage);
                }
            }

            // 2. Cập nhật Sidebar (Danh sách người/nhóm) để hiển thị tin nhắn mới nhất
            // Phần này giúp UI Sidebar cập nhật Real-time
            let targetName = null;
            let targetType = null;

            if (newMessage.type === 'room' || newMessage.type === 1) {
                // Chat nhóm: target là tên phòng
                targetName = newMessage.to;
                targetType = 1; // type 1 = group
            } else {
                // Chat 1-1
                if (newMessage.name === currentUserName) {
                    // Mình gửi -> update dòng của người nhận
                    targetName = newMessage.to;
                    targetType = 0; // type 0 = people
                } else {
                    // Người khác gửi -> update dòng của người gửi
                    targetName = newMessage.name;
                    targetType = 0; // type 0 = people
                }
            }

            if (targetName) {
                const index = state.people.findIndex(p => p.name === targetName);

                if (index !== -1) {
                    // Đã có trong list: Cập nhật message cuối và đưa lên đầu
                    const item = state.people[index];
                    item.actionTime = newMessage.createAt || new Date().toISOString();
                    item.lastMessage = newMessage.mes || newMessage.text || '';
                    // Xóa vị trí cũ
                    state.people.splice(index, 1);
                    // Chèn vào đầu
                    state.people.unshift(item);
                } else {
                    // Chưa có: Thêm mới vào đầu danh sách
                    // Lưu ý: Chỉ thêm nếu có đủ thông tin, tránh noise
                    const newItem = {
                        name: targetName,
                        type: targetType,
                        actionTime: newMessage.createAt || new Date().toISOString(),
                        lastMessage: newMessage.mes || newMessage.text || '',
                        isOnline: false // Default
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
    },
});

export const {
    setPeople, setActiveChat, setMessages, addMessage,
    setChatHistory, clearChat, setOnlineStatus, clearMessages,
    setPendingRoomCreation, clearPendingRoomCreation,
    setPendingPage, updateRoomData
} = chatSlice.actions;

export default chatSlice.reducer;
