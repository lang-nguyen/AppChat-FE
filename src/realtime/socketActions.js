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
        console.log(`Da gui [${eventName}]:`, payload);
    } else {
        console.error("Socket chua ket noi, khong the gui:", eventName);
    }
};

export const socketActions = {
    login: (socketRef, username, password) => {
        sendRawData(socketRef, "LOGIN", { user: username, pass: password });
    },

    reLogin: (socketRef, username, reLoginCode) => {
        sendRawData(socketRef, "RE_LOGIN", { user: username, RE_LOGIN_CODE: reLoginCode });
    },

    register: (socketRef, username, password) => {
        sendRawData(socketRef, "REGISTER", { user: username, pass: password });
    },

    sendChat: (socketRef, to, message, chatType = "people") => {
        sendRawData(socketRef, "SEND_CHAT", { type: chatType, to: to, mes: message });
    },

    getUserList: (socketRef) => {
        sendRawData(socketRef, "GET_USER_LIST", {});
    }
}

