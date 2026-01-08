import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSocket } from "../../../app/providers/useSocket.js";
import { clearMessages, addMessage } from "../../../state/chat/chatSlice.js";

/**
 * Hook xử lý toàn bộ logic của phần ChatBox và ChatInfo.
 * Cải tiến cơ chế tải lịch sử tin nhắn và xử lý trạng thái Socket Reload.
 */
export const useChatMessage = () => {
    const dispatch = useDispatch();
    const { actions: socketActions, isReady } = useSocket();

    // -- Selectors --
    const activeChat = useSelector((state) => state.chat.activeChat);
    const messages = useSelector((state) => state.chat.messages);
    const onlineStatus = useSelector((state) => state.chat.onlineStatus);
    const people = useSelector((state) => state.chat.people);
    const user = useSelector((state) => state.auth.user);
    const hasMore = useSelector((state) => state.chat.hasMore);

    // -- Local State --
    const [showInfo, setShowInfo] = useState(false);
    const [inputText, setInputText] = useState('');
    const [page, setPage] = useState(1);
    const [isLoading, setIsLoading] = useState(false);

    // -- Refs --
    const messagesEndRef = useRef(null);
    const chatContainerRef = useRef(null);
    const prevScrollHeightRef = useRef(0);
    const lastFetchedKeyRef = useRef(''); // Để tránh fetch trùng lặp khi re-render
    const currentPageRef = useRef(1); // Track page hiện tại để tránh mất sync với server response

    // -- Derived Data --
    const myUsername = useMemo(() => {
        return user?.user || user?.username || localStorage.getItem('user_name') || "";
    }, [user]);

    const isOnline = useMemo(() => {
        return activeChat &&
            (activeChat.type === 0 || activeChat.type === 'people') &&
            !!onlineStatus[activeChat.name];
    }, [activeChat, onlineStatus]);

    const memberList = useMemo(() => {
        if (!activeChat) return [];
        const currentUserName = user?.name || user?.user || user?.username || localStorage.getItem("user_name") || "Tên người dùng";

        if (activeChat.type === 0 || activeChat.type === 'people') {
            return [
                { name: currentUserName, isOnline: true },
                { name: activeChat.name, isOnline: !!onlineStatus[activeChat.name] }
            ];
        } else {
            const roomData = people.find(p => p.name === activeChat.name && p.type === activeChat.type);
            const userList = roomData?.userList || [];
            return userList.map(m => {
                const name = typeof m === 'string' ? m : m.name;
                const isOwner = typeof m === 'object' ? m.isOwner : false;
                return { name, isOnline: !!onlineStatus[name], isOwner };
            });
        }
    }, [activeChat, people, onlineStatus, user]);

    // -- Methods --
    const scrollToBottom = useCallback((behavior = 'auto') => {
        // Dùng requestAnimationFrame để đợi DOM render xong
        requestAnimationFrame(() => {
            if (chatContainerRef.current) {
                const { scrollHeight } = chatContainerRef.current;
                chatContainerRef.current.scrollTo({
                    top: scrollHeight,
                    behavior
                });
            }
            // Fallback bằng scrollIntoView
            if (messagesEndRef.current) {
                messagesEndRef.current.scrollIntoView({ behavior, block: 'end' });
            }
        });
    }, []);

    // -- Effects --

    // Effect: Khi chọn phòng chat hoặc Socket Reconnect
    useEffect(() => {
        if (activeChat && isReady) {
            // Clear tin nhắn cũ ngay lập tức
            dispatch(clearMessages());

            // Reset state khi đổi phòng
            // Defer state update để tránh rule `react-hooks/set-state-in-effect`
            queueMicrotask(() => setPage(1));
            currentPageRef.current = 1; // Reset page ref
            queueMicrotask(() => setShowInfo(false));
            lastFetchedKeyRef.current = '';

            // Set pending page to window for socketHandlers
            if (typeof window !== 'undefined') window.__chatPendingPage = 1;

            // Fetch tin nhắn trang đầu tiên
            const fetchKey = `${activeChat.type}:${activeChat.name}:1`;
            queueMicrotask(() => setIsLoading(true));
            lastFetchedKeyRef.current = fetchKey;

            if (activeChat.type === 0 || activeChat.type === 'people') {
                socketActions.chatHistory(activeChat.name, 1);
                socketActions.checkOnline(activeChat.name);
            } else {
                // Join room trước khi lấy lịch sử
                socketActions.joinRoom(activeChat.name);
                socketActions.roomHistory(activeChat.name, 1);
            }

            // Fallback: Tắt loading sau 5s nếu không có response
            const timeoutId = setTimeout(() => {
                setIsLoading(false);
            }, 5000);

            return () => clearTimeout(timeoutId);
        }
    }, [activeChat, isReady, socketActions, dispatch]);

    // Effect: Xử lý mượt mà khi dữ liệu tin nhắn về
    useEffect(() => {
        // CHỈ xử lý khi đang loading (tránh vòng lặp)
        if (!isLoading) return;

        if (page === 1) {
            if (messages.length > 0) {
                // Trang đầu tiên có tin nhắn: cuộn xuống cuối
                // Dùng timeout ngắn để đảm bảo tin nhắn đã render xong nội dung (kể cả ảnh nếu có cache)
                setTimeout(() => scrollToBottom('auto'), 50);
                queueMicrotask(() => setIsLoading(false));
            } else if (!hasMore) {
                // Trang đầu tiên không có tin nhắn và server báo hết data
                queueMicrotask(() => setIsLoading(false));
            }
            // Nếu page === 1 và messages.length === 0 và hasMore === true
            // → Đang chờ data, không tắt loading
        } else {
            // page > 1: Load more
            // Chỉ tắt loading khi có data mới hoặc hết data
            const shouldStopLoading = messages.length > 0 || !hasMore;
            if (shouldStopLoading) {
                if (chatContainerRef.current && messages.length > 0) {
                    const newScrollHeight = chatContainerRef.current.scrollHeight;
                    chatContainerRef.current.scrollTop = newScrollHeight - prevScrollHeightRef.current;
                }
                queueMicrotask(() => setIsLoading(false));
            }
        }
    }, [messages.length, hasMore, page, scrollToBottom, isLoading]);

    // Effect: Tự động scroll xuống khi có tin nhắn mới (chỉ khi đang ở gần cuối)
    useEffect(() => {
        if (messages.length > 0 && page === 1 && chatContainerRef.current) {
            const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
            const isNearBottom = scrollHeight - scrollTop - clientHeight < 150;

            // Chỉ tự động scroll nếu user đang ở gần cuối (không làm phiền khi đang đọc tin cũ)
            if (isNearBottom) {
                scrollToBottom('smooth');
            }
        }
    }, [messages.length, page, scrollToBottom]);

    const loadMore = useCallback(() => {
        if (!hasMore || isLoading || !isReady) return;

        if (chatContainerRef.current) {
            prevScrollHeightRef.current = chatContainerRef.current.scrollHeight;
        }

        const nextPage = page + 1;
        setPage(nextPage);
        currentPageRef.current = nextPage; // Update ref để track page

        // Set pending page to window for socketHandlers
        if (typeof window !== 'undefined') window.__chatPendingPage = nextPage;

        // Fetch tin nhắn trang tiếp theo
        if (activeChat) {
            setIsLoading(true);
            const fetchKey = `${activeChat.type}:${activeChat.name}:${nextPage}`;
            lastFetchedKeyRef.current = fetchKey;

            console.log(`[LoadMore] Fetching page ${nextPage} for ${activeChat.name}`);

            if (activeChat.type === 0 || activeChat.type === 'people') {
                socketActions.chatHistory(activeChat.name, nextPage);
            } else {
                socketActions.roomHistory(activeChat.name, nextPage);
            }
        }
    }, [page, hasMore, isLoading, isReady, activeChat, socketActions]);

    const handleScroll = useCallback(() => {
        if (!chatContainerRef.current || isLoading || !hasMore) return;

        const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;

        // CHỈ trigger load more khi:
        // 1. Scroll ở gần đầu (scrollTop <= 50)
        // 2. ĐÃ có content để scroll (scrollHeight > clientHeight)
        // 3. Không phải trang đầu tiên vừa load xong
        const hasContent = scrollHeight > clientHeight;
        const isAtTop = scrollTop <= 50;

        if (isAtTop && hasContent && page >= 1) {
            loadMore();
        }
    }, [loadMore, isLoading, hasMore, page]);

    const handleSend = useCallback((e) => {
        e.preventDefault();
        if (!inputText.trim() || !activeChat || !socketActions || !isReady) return;

        // 1. Tạo tin nhắn tạm thời (Optimistic UI)
        const tempId = Date.now().toString();
        const currentName = user?.name || user?.user || user?.username || localStorage.getItem('user_name') || 'Tôi';

        const optimisticMessage = {
            name: currentName,
            mes: inputText,
            createAt: new Date().toISOString(),
            to: activeChat.name,
            type: (activeChat.type === 0 || activeChat.type === 'people') ? 'people' : 'room',
            tempId: tempId // Để phân biệt và tránh trùng lặp sau này
        };

        // 2. Dispatch lên Redux ngay lập tức
        dispatch(addMessage(optimisticMessage));

        // 3. Gửi qua Socket
        if (activeChat.type === 0 || activeChat.type === 'people') {
            socketActions.sendChat(activeChat.name, inputText, 'people');
        } else {
            socketActions.sendChat(activeChat.name, inputText, 'room');
        }
        setInputText('');

        // 4. Scroll xuống ngay lập tức (không cần timeout vì state đã update)
        requestAnimationFrame(() => {
            scrollToBottom('smooth');
        });
    }, [inputText, activeChat, socketActions, isReady, scrollToBottom, dispatch, user]);

    const handleAddMember = useCallback(() => {
        const username = window.prompt("Nhập tên người dùng muốn thêm vào nhóm:");
        if (username && socketActions) {
            socketActions.checkExist(username);
            window.alert(`Đã gửi yêu cầu thêm thành viên ${username}`);
        }
    }, [socketActions]);

    const handleCreateRoom = useCallback(() => {
        const roomName = window.prompt("Nhập tên phòng chat mới:");
        if (roomName && socketActions) {
            socketActions.createRoom(roomName);
        }
    }, [socketActions]);

    return {
        activeChat, messages, myUsername, isOnline, memberList,
        showInfo, setShowInfo, inputText, setInputText, page,
        isLoading, hasMore, messagesEndRef, chatContainerRef,
        handleScroll, handleSend, handleAddMember, handleCreateRoom
    };
};
