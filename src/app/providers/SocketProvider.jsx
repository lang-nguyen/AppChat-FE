// Quản lý kết nối và giữ kho dữ liệu (State)
import React, { createContext, useContext, useEffect, useRef, useState, useMemo } from 'react';
import { socketActions } from "../../realtime/socketActions.js";
import { handleSocketMessage } from "../../realtime/socketHandlers.js";

// Tạo context
const SocketContext = createContext(null);

// Tạo provider
export const SocketProvider = ({ children }) => {
    const WS_URL = import.meta.env.VITE_WS_URL;
    const socketRef = useRef(null); // luu ket noi
    const [messages, setMessages] = useState([]); // list tin nhan
    const [isReady, setIsReady] = useState(false); // trang thai ket noi
    const [user, setUser] = useState(null); // state de biet login hay chua
    const [people, setPeople] = useState([]); // list user
    const [error, setError] = useState("");
    const [registerSuccess, setRegisterSuccess] = useState(false);
    const [checkUserResult, setCheckUserResult] = useState(null); // Kết quả kiểm tra user


    useEffect(() => {
        let reconnectTimeout;

        const connect = () => {
            // 1. Tao ket noi WebSocket
            const socket = new WebSocket(WS_URL);
            socketRef.current = socket;

            // khi ket noi thanh cong
            socket.onopen = () => {
                console.log('WebSocket da ket noi');
                setIsReady(true);
                setError(""); // Xóa lỗi cũ nếu có

                // Tự động Re-login dùng hàm từ socketActions
                // Lấy code và username từ localStorage
                const code = localStorage.getItem('re_login_code');
                const savedUser = localStorage.getItem('user_name');

                // Nếu có thì gọi hàm reLogin
                if (code && savedUser) {
                    console.log(`Phát hiện phiên cũ của [${savedUser}], đang Re-login...`);
                    socketActions.reLogin(socketRef, savedUser, code);
                } else {
                    console.log("Không tìm thấy phiên đăng nhập cũ.");
                }

                // --- HEARTBEAT START ---
                // Gửi ping mỗi 30s để giữ kết nối
                const pingInterval = setInterval(() => {
                    socketActions.ping(socketRef);
                }, 30000);
                // Lưu interval ID vào object socket để clear khi close (trick: gán thô vào object)
                socket.pingInterval = pingInterval;
            };

            socket.onmessage = (event) => {
                // Cần try-catch để tránh crash app nếu server gửi JSON lỗi
                try {
                    const response = JSON.parse(event.data);
                    if (response.event !== "GET_USER_LIST") {
                        console.log("Tin nhan moi:", response);
                    }

                    // Gọi hàm handler tách biệt
                    handleSocketMessage(response, {
                        setMessages,
                        setPeople,
                        setUser,
                        setError,
                        setRegisterSuccess,
                        setCheckUserResult
                    });
                } catch (err) {
                    console.error("Lỗi parse JSON:", err);
                }
            };

            // Khi mat ket noi
            socket.onclose = () => {
                console.log('WebSocket da ngat ket noi. Thu ket noi lai sau 3s...');
                setIsReady(false);
                if (socket.pingInterval) clearInterval(socket.pingInterval);

                // Tự động kết nối lại sau 3 giây
                reconnectTimeout = setTimeout(() => {
                    console.log("Dang thu ket noi lai...");
                    connect();
                }, 3000);
            };

            socket.onerror = (err) => {
                console.error("WebSocket lỗi:", err);
                setIsReady(false);
                socket.close(); // Gọi close để kích hoạt onclose và retry
            };
        };

        connect();

        // Chạy khi Component bị hủy (Unmount)
        return () => {
            if (reconnectTimeout) clearTimeout(reconnectTimeout);

            if (socketRef.current) {
                // Hủy onclose để không trigger reconnect khi unmount component
                socketRef.current.onclose = null; // đóng luôn không reconnect
                socketRef.current.close();
            }
        };
    }, []); // [] -> Đảm bảo chỉ chạy 1 lần

    // Gom các hàm gửi lại thành 1 object actions
    // Dùng useMemo để tránh tạo lại object này mỗi lần render không cần thiết
    const actions = useMemo(() => ({
        login: (u, p) => socketActions.login(socketRef, u, p),
        register: (u, p) => socketActions.register(socketRef, u, p),
        sendChat: (to, mes, chatType = "people") => socketActions.sendChat(socketRef, to, mes, chatType),
        logout: () => socketActions.logout(socketRef),
        checkUserExist: (username) => socketActions.checkUserExist(socketRef, username)
    }), []); // [] dependency vì socketRef là ref, nó không trigger render

    // Gia tri cung cap cho toan bo component con
    const value = useMemo(() => ({
        socket: socketRef.current,
        isReady,
        messages,
        people,
        user,
        error,
        setError,
        actions,
        registerSuccess,
        setRegisterSuccess,
        checkUserResult,
        setCheckUserResult
    }), [isReady, messages, people, user, error, actions, registerSuccess, checkUserResult]);
    return (
        <SocketContext.Provider value={value}>
            {children}
        </SocketContext.Provider>
    );
};

// hook de ben ngoai su dung
export const useSocket = () => {
    return useContext(SocketContext);
}
