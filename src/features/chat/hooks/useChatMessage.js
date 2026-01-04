import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSocket } from "../../../app/providers/SocketProvider.jsx";
import { setMessages } from "../../../state/chat/chatSlice.js";

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
                return { name, isOnline: !!onlineStatus[name] };
            });
        }
    }, [activeChat, people, onlineStatus, user]);

    // -- Methods --
    const fetchMessages = useCallback((pageNum) => {
        if (!activeChat || !socketActions || !isReady) return;

        const fetchKey = `${activeChat.type}:${activeChat.name}:${pageNum}`;
        // Nếu vừa fetch xong và dữ liệu chưa về, không fetch lại cùng 1 key
        if (isLoading && lastFetchedKeyRef.current === fetchKey) return;

        setIsLoading(true);
        lastFetchedKeyRef.current = fetchKey;

        if (activeChat.type === 0 || activeChat.type === 'people') {
            socketActions.chatHistory(activeChat.name, pageNum);
        } else {
            socketActions.roomHistory(activeChat.name, pageNum);
        }
    }, [activeChat, socketActions, isReady, isLoading]);

    const scrollToBottom = useCallback((behavior = 'auto') => {
        // Dùng requestAnimationFrame hoặc timeout để đợi DOM render xong
        setTimeout(() => {
            if (messagesEndRef.current) {
                messagesEndRef.current.scrollIntoView({ behavior });
            }
        }, 50);
    }, []);

    // -- Effects --

    // Effect: Khi chọn phòng chat hoặc Socket Reconnect
    useEffect(() => {
        if (activeChat && isReady) {
            // Chỉ xóa tin nhắn cũ nếu là chuyển sang phòng KHÁC
            // Nếu chỉ là reconnect cùng 1 phòng, ta refetch để cập nhật tin nhắn mới
            setPage(1);
            fetchMessages(1);
            setShowInfo(false);

            if (activeChat.type === 0 || activeChat.type === 'people') {
                socketActions.checkOnline(activeChat.name);
            }
        }
    }, [activeChat, isReady, socketActions, fetchMessages]);

    // Effect: Xử lý mượt mà khi dữ liệu tin nhắn về
    useEffect(() => {
        if (messages.length > 0 || !hasMore) {
            if (page === 1) {
                // Trang đầu tiên: luôn cuộn xuống cuối
                scrollToBottom();
            } else if (chatContainerRef.current) {
                // Giữ vị trí scroll khi load thêm tin nhắn cũ
                const newScrollHeight = chatContainerRef.current.scrollHeight;
                chatContainerRef.current.scrollTop = newScrollHeight - prevScrollHeightRef.current;
            }
            // Tắt loading sau khi đã xử lý layout xong
            const timer = setTimeout(() => setIsLoading(false), 100);
            return () => clearTimeout(timer);
        }
    }, [messages, page, hasMore, scrollToBottom]);

    const loadMore = useCallback(() => {
        if (!hasMore || isLoading || !isReady) return;

        if (chatContainerRef.current) {
            prevScrollHeightRef.current = chatContainerRef.current.scrollHeight;
        }
        const nextPage = page + 1;
        setPage(nextPage);
        fetchMessages(nextPage);
    }, [page, fetchMessages, hasMore, isLoading, isReady]);

    const handleScroll = useCallback(() => {
        if (chatContainerRef.current && !isLoading && hasMore) {
            const { scrollTop } = chatContainerRef.current;
            if (scrollTop <= 10) { // Tăng ngưỡng nhạy lên 10px
                loadMore();
            }
        }
    }, [loadMore, isLoading, hasMore]);

    const handleSend = useCallback((e) => {
        e.preventDefault();
        if (!inputText.trim() || !activeChat || !socketActions || !isReady) return;

        if (activeChat.type === 0 || activeChat.type === 'people') {
            socketActions.sendChat(activeChat.name, inputText, 'people');
        } else {
            socketActions.sendChat(activeChat.name, inputText, 'room');
        }
        setInputText('');
        // Sau khi gửi tin nhắn, cuộn xuống cuối để thấy tin nhắn của mình
        scrollToBottom('smooth');
    }, [inputText, activeChat, socketActions, isReady, scrollToBottom]);

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
