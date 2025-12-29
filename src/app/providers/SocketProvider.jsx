// Quản lý kết nối và giữ kho dữ liệu (State)
import React, {createContext, useContext, useEffect, useMemo, useRef, useState} from "react";
import {useDispatch} from "react-redux";
import {socketActions} from "../../realtime/socketActions.js";
import {handleSocketMessage} from "../../realtime/socketHandlers.js";

// Tạo context
const SocketContext = createContext(null);

// Tạo provider
export const SocketProvider = ({children}) => {
    const WS_URL = 'wss://chat.longapp.site/chat/chat';
    const socketRef = useRef(null); // luu ket noi
    const dispatch = useDispatch();

    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        // 1. Tao ket noi WebSocket
        const socket = new WebSocket(WS_URL);
        socketRef.current = socket;

        // khi ket noi thanh cong
        socket.onopen = () => {
            console.log("WebSocket da ket noi");
            setIsReady(true);

            // Tự động Re-login dùng hàm từ socketActions
            const code = localStorage.getItem("re_login_code");
            const savedUser = localStorage.getItem("user_name");
            if (code && savedUser) {
                socketActions.reLogin(socketRef, savedUser, code);
            }
        };

        socket.onmessage = (event) => {
            // Cần try-catch để tránh crash app nếu server gửi JSON lỗi
            try {
                const response = JSON.parse(event.data);
                // Gọi hàm handler tách biệt
                handleSocketMessage(response, dispatch);
            } catch (err) {
                console.error("Lỗi parse JSON:", err);
            }
        };

        // Khi mat ket noi
        socket.onclose = () => {
            console.log('WebSocket da ngat ket noi');
            setIsReady(false);
        };

        socket.onerror = (err) => {
            console.error("WebSocket lỗi:", err);
            setIsReady(false);
        };

        // Chạy khi Component bị hủy (Unmount)
        return () => {
            socket.close();
        };
    }, [dispatch]);

    // Gom các hàm gửi lại thành 1 object actions
    // Dùng useMemo để tránh tạo lại object này mỗi lần render không cần thiết
    const actions = useMemo(
        () => ({
            login: (u, p) => socketActions.login(socketRef, u, p),
            register: (u, p) => socketActions.register(socketRef, u, p),
            sendChat: (to, mes, chatType = "people") => socketActions.sendChat(socketRef, to, mes, chatType),
            getUserList: () => socketActions.getUserList(socketRef),
        }),
        []
    ); // [] dependency vì socketRef là ref, nó không trigger render

    // Gia tri cung cap cho toan bo component con
    const value = useMemo(
        () => ({
            isReady,
            actions,
            getSocket: () => socketRef.current,
        }),
        [isReady, actions]
    );

    return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
};

// hook de ben ngoai su dung
export const useSocket = () => useContext(SocketContext);

