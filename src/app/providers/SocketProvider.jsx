/* eslint-disable react-refresh/only-export-components */
// Quản lý kết nối và giữ kho dữ liệu (State)
import React, { useEffect, useRef, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { store } from '../store.js';
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
    const [connectionError, setConnectionError] = useState(null); //+1 State lỗi kết nối
    const [retryCount, setRetryCount] = useState(0); //+1 State để trigger retry

    // REDUX DISPATCH
    const dispatch = useDispatch();

    //Lấy user từ Redux Store
    const user = useSelector((state) => state.auth.user);

    // Lưu ping interval ID
    const pingIntervalRef = useRef(null);

    const lastActivityRef = useRef(0);
    const reconnectTimeoutRef = useRef(null); //+1 Quản lý reconnect timeout
    const isConnectingRef = useRef(false); //+1 Tránh tạo nhiều kết nối cùng lúc


    useEffect(() => {
        // Khởi tạo lastActivityRef trong useEffect để tránh lỗi impure function
        lastActivityRef.current = Date.now();
        let reconnectAttempts = 0; //+1 Đếm số lần reconnect
        const MAX_RECONNECT_ATTEMPTS = 5; // nếu reconnect 5 lần vẫn thất bại thì dừng retry và báo lỗi
        const BASE_DELAY = 3000;

        const connect = () => {
            //+1 Check mạng trước khi connect
            if (!navigator.onLine) {
                console.log('Mất kết nối mạng, dừng connect.');
                setIsReady(false);
                setConnectionError("Mất kết nối Internet. Vui lòng kiểm tra đường truyền.");
                return;
            }

            //+1 Reset lỗi khi bắt đầu kết nối
            setConnectionError(null);

            //+1 Tránh tạo nhiều kết nối cùng lúc
            if (isConnectingRef.current || (socketRef.current && socketRef.current.readyState === WebSocket.CONNECTING)) {
                console.log('Đang kết nối, bỏ qua...');
                return;
            }

            //+1 Đóng kết nối cũ nếu có
            if (socketRef.current) {
                const oldSocket = socketRef.current;
                oldSocket.onopen = null;
                oldSocket.onclose = null;
                oldSocket.onerror = null;
                oldSocket.onmessage = null;
                if (oldSocket.readyState === WebSocket.OPEN || oldSocket.readyState === WebSocket.CONNECTING) {
                    oldSocket.close();
                }
            }

            isConnectingRef.current = true; //+1
            // 1. Tao ket noi WebSocket
            const socket = new WebSocket(WS_URL);
            socketRef.current = socket;

            // khi ket noi thanh cong
            socket.onopen = () => {
                console.log('WebSocket da ket noi');
                isConnectingRef.current = false; //+1
                setIsReady(true);
                setConnectionError(null); //+1 Clear error
                // Lưu thời gian hoạt động gần nhất
                lastActivityRef.current = Date.now();
                reconnectAttempts = 0; //+1 Reset số lần reconnect

                // ... (Phần Re-login logic giữ nguyên)
                const code = localStorage.getItem('re_login_code');
                const savedUser = localStorage.getItem('user_name');
                const isAuthPage = window.location.pathname === '/login' || window.location.pathname === '/register';

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

                    // Chỉ log các event quan trọng, không log GET_USER_LIST và SEND_CHAT để tránh spam
                    const silentEvents = ["GET_USER_LIST", "SEND_CHAT", "CHECK_USER_ONLINE"];
                    if (!silentEvents.includes(response.event)) {
                        console.log("[Socket] Nhận:", response.event, response);
                    }

                    // Gọi hàm handler tách biệt, truyền dispatch, socketActions, socketRef và getState
                    handleSocketMessage(response, dispatch, socketActions, socketRef, () => store.getState());
                } catch (err) {
                    console.error("Lỗi parse JSON:", err);
                }
            };

            // Khi mat ket noi
            socket.onclose = (event) => {
                console.log('WebSocket da ngat ket noi. Code:', event.code, 'Reason:', event.reason); //+1
                isConnectingRef.current = false; //+1
                setIsReady(false);

                // Clear ping interval
                if (pingIntervalRef.current) {
                    clearInterval(pingIntervalRef.current);
                    pingIntervalRef.current = null;
                }

                // Nếu mất mạng (detected bởi browser) thì không retry kiểu exponential ngay mà đợi online event
                if (!navigator.onLine) {
                    setConnectionError("Mất kết nối Internet. Vui lòng kiểm tra đường truyền.");
                    return;
                }

                // Luôn reconnect (kể cả code 1000 - Normal Closure do Server gửi khi Logout)
                if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
                    //+1 Exponential backoff: tăng delay mỗi lần reconnect
                    const delay = Math.min(BASE_DELAY * Math.pow(2, reconnectAttempts), 30000); //+1 Max 30s
                    reconnectAttempts++; //+1

                    console.log(`Thu ket noi lai sau ${delay}ms (lan thu ${reconnectAttempts})...`); //+1
                    reconnectTimeoutRef.current = setTimeout(() => { //+1
                        connect();
                    }, delay);
                } else if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) { //+1
                    console.error('Đã vượt quá số lần reconnect tối đa'); //+1
                    setConnectionError("Không thể kết nối đến máy chủ. Vui lòng kiểm tra đường truyền."); //+1 Set error msg
                }
            };

            socket.onerror = (err) => {
                console.error("WebSocket lỗi:", err);
                isConnectingRef.current = false; //+1
                setIsReady(false);
                if (socket.readyState === WebSocket.OPEN) {
                    socket.close();
                }
            };
        };

        // Listeners cho online/offline
        const handleOnline = () => {
            console.log("Mạng đã có trở lại, reconnecting...");
            setConnectionError(null);
            reconnectAttempts = 0;
            connect();
        };

        const handleOffline = () => {
            console.log("Đã mất kết nối mạng.");
            setIsReady(false);
            setConnectionError("Mất kết nối Internet. Vui lòng kiểm tra đường truyền.");
            if (socketRef.current) {
                socketRef.current.close();
            }
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
            }
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        connect();

        // Chạy khi Component bị hủy (Unmount)
        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);

            isConnectingRef.current = false;

            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
                reconnectTimeoutRef.current = null;
            }

            // Clear ping interval
            if (pingIntervalRef.current) {
                clearInterval(pingIntervalRef.current);
                pingIntervalRef.current = null;
            }

            if (socketRef.current) {
                //+1 Hủy tất cả handlers để tránh trigger reconnect khi unmount
                socketRef.current.onclose = null; // đóng luôn không reconnect
                socketRef.current.onerror = null; 
                socketRef.current.onmessage = null; 
                socketRef.current.onopen = null; 

                //+1 Chỉ close nếu socket đang mở hoặc đang kết nối
                if (socketRef.current.readyState === WebSocket.OPEN || socketRef.current.readyState === WebSocket.CONNECTING) {
                    socketRef.current.close(1000, 'Component unmounting');
                }
                socketRef.current = null;
            }
        };
    }, [dispatch, retryCount]); //+1 Thêm retryCount vào dependency để trigger reconnect

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
            const IDLE_TIME_BEFORE_PING = 25000;
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
            logout: () => {
                lastActivityRef.current = Date.now();
                socketActions.logout(socketRef);
            },
        }),
        []
    );

    // Gia tri cung cap cho toan bo component con
    const value = useMemo(() => ({
        // socket: socketRef.current,
        isReady,
        actions,
        connectionError, //+1 Expose error
        reconnect: () => setRetryCount(prev => prev + 1) //+1 Expose reconnect function
    }), [isReady, actions, connectionError]);
    return (
        <SocketContext.Provider value={value}>
            {children}
        </SocketContext.Provider>
    );
};