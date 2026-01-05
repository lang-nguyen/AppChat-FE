/* eslint-disable react-refresh/only-export-components */
// Quản lý kết nối và giữ kho dữ liệu (State)
import React, { useEffect, useRef, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { socketActions } from "../../realtime/socketActions.js";
import { handleSocketMessage } from "../../realtime/socketHandlers.js";
import { SocketContext } from './SocketContext.js';

// Tạo provider
export const SocketProvider = ({ children }) => {
    // import.meta.env.VITE_WS_URL ||
    const WS_URL = 'wss://chat.longapp.site/chat/chat';
    const socketRef = useRef(null); // luu ket noi
    const [isReady, setIsReady] = useState(false); // trang thai ket noi

    // REDUX DISPATCH
    const dispatch = useDispatch();

    //Lấy user từ Redux Store
    const user = useSelector((state) => state.auth.user);

    // Lưu ping interval ID
    const pingIntervalRef = useRef(null);

    const lastActivityRef = useRef(0);

    useEffect(() => {
        // Khởi tạo lastActivityRef trong useEffect để tránh lỗi impure function
        lastActivityRef.current = Date.now();
        let reconnectTimeout;

        const connect = () => {
            // 1. Tao ket noi WebSocket
            const socket = new WebSocket(WS_URL);
            socketRef.current = socket;

            // khi ket noi thanh cong
            socket.onopen = () => {
                console.log('WebSocket da ket noi');
                setIsReady(true);
                // Lưu thời gian hoạt động gần nhất
                lastActivityRef.current = Date.now();

                // Tự động Re-login dùng hàm từ socketActions
                // Lấy code và username từ localStorage
                const code = localStorage.getItem('re_login_code');
                const savedUser = localStorage.getItem('user_name');

                // Check nếu đang ở trang Login/Register thì KHÔNG tự động re-login
                // Để tránh xung đột với các Tab khác đang mở
                const isAuthPage = window.location.pathname === '/login' || window.location.pathname === '/register';

                // Nếu có thì gọi hàm reLogin
                if (code && savedUser && !isAuthPage) {
                    console.log(`Phát hiện phiên cũ của [${savedUser}], đang Re-login...`);
                    socketActions.reLogin(socketRef, savedUser, code);
                } else {
                    console.log("Không tìm thấy phiên cũ hoặc đang ở trang Auth.");
                }
            };

            socket.onmessage = (event) => {
                // Cần try-catch để tránh crash app nếu server gửi JSON lỗi
                try {
                    const response = JSON.parse(event.data);
                    // Reset thời gian hoạt động gần nhất khi có tin nhắn mới
                    lastActivityRef.current = Date.now();

                    if (response.event !== "GET_USER_LIST") {
                        console.log("Tin nhan moi:", response);
                    }

                    // Gọi hàm handler tách biệt, truyền dispatch
                    handleSocketMessage(response, dispatch);
                } catch (err) {
                    console.error("Lỗi parse JSON:", err);
                }
            };

            // Khi mat ket noi
            socket.onclose = () => {
                console.log('WebSocket da ngat ket noi. Thu ket noi lai sau 3s...');
                setIsReady(false);

                // Clear ping interval
                if (pingIntervalRef.current) {
                    clearInterval(pingIntervalRef.current);
                    pingIntervalRef.current = null;
                }

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

            // Clear ping interval
            if (pingIntervalRef.current) {
                clearInterval(pingIntervalRef.current);
                pingIntervalRef.current = null;
            }

            if (socketRef.current) {
                // Hủy onclose để không trigger reconnect khi unmount component
                socketRef.current.onclose = null; // đóng luôn không reconnect
                socketRef.current.close();
            }
        };
    }, [dispatch]); // [] -> Đảm bảo chỉ chạy 1 lần

    // Setup ping riêng, chỉ khi đã login
    useEffect(() => {
        if (!isReady) return;

        const hasUser = user && (user.user || user.name || user.username);
        if (!hasUser) {
            if (pingIntervalRef.current) {
                clearInterval(pingIntervalRef.current);
                pingIntervalRef.current = null;
            }
            return;
        }

        // --- HEARTBEAT START ---
        // Gửi ping mỗi 30s để giữ kết nối (chỉ khi idle quá lâu)
        pingIntervalRef.current = setInterval(() => {
            if (socketRef.current?.readyState !== WebSocket.OPEN) return;

            const timeSinceLastActivity = Date.now() - lastActivityRef.current;
            const IDLE_TIME_BEFORE_PING = 25000; // 25s - chỉ ping nếu idle 25s

            if (timeSinceLastActivity >= IDLE_TIME_BEFORE_PING) {
                socketActions.ping(socketRef);
            }
        }, 30000);

        return () => {
            if (pingIntervalRef.current) {
                clearInterval(pingIntervalRef.current);
                pingIntervalRef.current = null;
            }
        };
    }, [isReady, user]);

    // Gom các hàm gửi lại thành 1 object actions
    // Dùng useMemo để tránh tạo lại object này mỗi lần render không cần thiết

    const actions = useMemo(
        () => ({
            login: (u, p) => {
                lastActivityRef.current = Date.now();
                socketActions.login(socketRef, u, p);
            },
            register: (u, p) => {
                lastActivityRef.current = Date.now();
                socketActions.register(socketRef, u, p);
            },
            sendChat: (to, mes, chatType = "people") => {
                lastActivityRef.current = Date.now();
                socketActions.sendChat(socketRef, to, mes, chatType);
            },
            chatHistory: (to, page) => {
                lastActivityRef.current = Date.now();
                socketActions.chatHistory(socketRef, to, page);
            },
            roomHistory: (room, page) => {
                lastActivityRef.current = Date.now();
                socketActions.roomHistory(socketRef, room, page);
            },
            createRoom: (name) => {
                lastActivityRef.current = Date.now();
                socketActions.createRoom(socketRef, name);
            },
            joinRoom: (name) => {
                lastActivityRef.current = Date.now();
                socketActions.joinRoom(socketRef, name);
            },
            checkOnline: (name) => {
                lastActivityRef.current = Date.now();
                socketActions.checkOnline(socketRef, name);
            },
            checkExist: (name) => {
                lastActivityRef.current = Date.now();
                socketActions.checkExist(socketRef, name);
            },
            getUserList: () => {
                lastActivityRef.current = Date.now();
                socketActions.getUserList(socketRef);
            },
        }),
        []
    ); // [] dependency vì socketRef là ref, nó không trigger render

    // Gia tri cung cap cho toan bo component con
    const value = useMemo(() => ({
        // socket: socketRef.current,
        isReady,
        actions
    }), [isReady, actions]);
    return (
        <SocketContext.Provider value={value}>
            {children}
        </SocketContext.Provider>
    );
};
