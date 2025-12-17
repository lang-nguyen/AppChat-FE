// Quản lý kết nối và giữ kho dữ liệu (State)
import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { handleSocketMessage } from '../utils/socketHandlers';
import {socketActions} from '../utils/socketActions';
// Tạo context
const SocketContext = createContext(null);

// Tạo provider
export const SocketProvider = ({ children }) => {
    const WS_URL = 'wss://chat.longapp.site/chat/chat';
    const socketRef = useRef(null); // luu ket noi
    const [messages, setMessages] = useState([]); // list tin nhan
    const [isReady, setIsReady] = useState(false); // trang thai ket noi
    const [user, setUser] = useState(null); // state de biet login hay chua
    const [people, setPeople] = useState([]); // list user
    const [error, setError] = useState("");


    useEffect(()=>{
        // 1. Tao ket noi WebSocket
        const socket = new WebSocket(WS_URL);
        socketRef.current = socket;

        // khi ket noi thanh cong
        socket.onopen = ()=>{
            console.log('WebSocket da ket noi');
            setIsReady(true)

            // Tự động Re-login dùng hàm từ socketActions
            const code = localStorage.getItem('re_login_code');
            const savedUser = localStorage.getItem('user_name');
            if(code && savedUser) {
                socketActions.reLogin(socketRef, savedUser, code);
            }
        };

        socket.onmessage = (event) => {
            const response = JSON.parse(event.data);
            console.log("Tin nhan moi:", response);

            // Truyền các hàm set state
            handleSocketMessage(response, {
                setMessages,
                setPeople,
                setUser,
                setError
            });
        };

        // Khi mat ket noi
        socket.onclose = ()=>{
            console.log('WebSocket da ngat ket noi');
            setIsReady(false);
        };

        return ()=>{
            socket.close();
        };
    }, []); // [] -> Đảm bảo chỉ chạy 1 lần

    // Gom các hàm gửi lại thành 1 object actions
    const actions = {
        login: (u, p) => socketActions.login(socketRef, u, p),
        register: (u, p) => socketActions.register(socketRef, u, p),
        sendChat: (to, mes, chatType = "people") => socketActions.sendChat(socketRef, to, mes, chatType)
    };
    // Gia tri cung cap cho toan bo component con
    const value = {
        socket: socketRef.current,
        isReady,
        messages,
        people,
        user,
        error,
        setError,
        actions
    };
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
