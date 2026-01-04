// Dóng gói dữ liệu để gửi đi
// Gui raw data
const sendRawData = (socketRef, eventName, dataPayload) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
        const payload = {
            action: "onchat",
            data: {
                event: eventName,
                data: dataPayload
            }
        };
        socketRef.current.send(JSON.stringify(payload));
        // Chỉ log cho các event quan trọng, không log mọi thứ
        if (eventName !== "GET_USER_LIST" && eventName !== "SEND_CHAT") {
            console.log(`[Socket] ${eventName}:`, dataPayload);
        }
    } else {
        console.error("Socket chua ket noi, khong the gui:", eventName);
    }
};

export const socketActions = {
    login: (socketRef, username, password) => {
        sendRawData(socketRef, "LOGIN", { user: username, pass: password });
    },

    reLogin: (socketRef, username, reLoginCode) => {
        sendRawData(socketRef, "RE_LOGIN", { user: username, code: reLoginCode });
    },

    register: (socketRef, username, password) => {
        sendRawData(socketRef, "REGISTER", { user: username, pass: password });
    },

    sendChat: (socketRef, to, message, chatType = "people") => {
        sendRawData(socketRef, "SEND_CHAT", { type: chatType, to: to, mes: message });
    },

    chatHistory: (socketRef, to, page = 1) => {
        sendRawData(socketRef, "GET_PEOPLE_CHAT_MES", { name: to, page });
    },

    roomHistory: (socketRef, roomName, page = 1) => {
        sendRawData(socketRef, "GET_ROOM_CHAT_MES", { room_name: roomName, page });
    },

    createRoom: (socketRef, roomName) => {
        sendRawData(socketRef, "CREATE_ROOM", { room_name: roomName });
    },

    joinRoom: (socketRef, roomName) => {
        sendRawData(socketRef, "JOIN_ROOM", { room_name: roomName });
    },

    checkOnline: (socketRef, username) => {
        sendRawData(socketRef, "CHECK_USER_ONLINE", { name: username });
    },

    checkExist: (socketRef, username) => {
        sendRawData(socketRef, "CHECK_USER_EXIST", { name: username });
    },

    getUserList: (socketRef) => {
        sendRawData(socketRef, "GET_USER_LIST", {});
    },

    checkUserExist: (socketRef, username) => {
        sendRawData(socketRef, "CHECK_USER_EXIST", { user: username });
    },

    ping: (socketRef) => {
        if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
            // Dùng GET_USER_LIST làm heartbeat để giữ kết nối vì server không hiểu action PING
            // Đây là một workaround an toàn
            socketActions.getUserList(socketRef);
        }
    },

    logout: (socketRef) => {
        sendRawData(socketRef, "LOGOUT", {});
    }
}
