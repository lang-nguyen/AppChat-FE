import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSocket } from "../../../app/providers/useSocket.js";
import { clearMessages, addMessage, setPendingPage } from "../../../state/chat/chatSlice.js";
import { encodeEmoji } from "../../../shared/utils/emojiUtils.js";
import { useChatScroll } from "./useChatScroll.js";
import { useChatFileUpload } from "./useChatFileUpload.js";
import { useChatPresence } from "./useChatPresence.js";

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
    // -- Sub-hooks --
    const {
        selectedFile,
        isUploading,
        handleSelectFile,
        handleRemoveFile,
        uploadSelectedFile
    } = useChatFileUpload();

    const [page, setPage] = useState(1);
    const [isLoading, setIsLoading] = useState(false);

    const {
        messagesEndRef,
        chatContainerRef,
        scrollToBottom,
        captureScrollHeight
    } = useChatScroll(messages, page, isLoading, hasMore);

    // -- Refs --
    const lastFetchedKeyRef = useRef(''); // Để tránh fetch trùng lặp khi re-render
    const currentPageRef = useRef(1); // Track page hiện tại để tránh mất sync với server response

    // -- Derived Data --
    const myUsername = useMemo(() => {
        return user?.user || user?.username || localStorage.getItem('user_name') || "";
    }, [user]);

    const isOnline = useMemo(() => {
        const status = activeChat &&
            (activeChat.type === 0 || activeChat.type === 'people') &&
            !!onlineStatus[activeChat.name];

        if (activeChat && (activeChat.type === 0 || activeChat.type === 'people')) {
            console.log(`[useChatMessage] isOnline for ${activeChat.name}:`, status, "| onlineStatus:", onlineStatus[activeChat.name]);
        }

        return status;
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

            // Clear file đang chọn nếu có
            handleRemoveFile();

            // Set pending page to Redux for socketHandlers
            dispatch(setPendingPage(1));

            // Fetch tin nhắn trang đầu tiên
            const fetchKey = `${activeChat.type}:${activeChat.name}:1`;
            queueMicrotask(() => setIsLoading(true));
            lastFetchedKeyRef.current = fetchKey;


            if (activeChat.type === 0 || activeChat.type === 'people') {
                console.log(`[useChatMessage] Calling checkOnline for ${activeChat.name}`);
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

    // Presence Sync for groups
    useChatPresence(isReady, activeChat, memberList, myUsername, onlineStatus, socketActions);

    // Effect: Tắt loading sau khi scroll đã xử lý (chỉ check logic loading ở đây)
    useEffect(() => {
        if (!isLoading) return;

        const shouldStopLoading = (page === 1 && (messages.length > 0 || !hasMore)) ||
            (page > 1 && (messages.length > 0 || !hasMore));

        if (shouldStopLoading) {
            queueMicrotask(() => setIsLoading(false));
        }
    }, [messages.length, hasMore, page, isLoading]);

    const loadMore = useCallback(() => {
        if (!hasMore || isLoading || !isReady) return;

        captureScrollHeight();

        const nextPage = page + 1;
        setPage(nextPage);
        currentPageRef.current = nextPage;

        // Set pending page to Redux for socketHandlers
        dispatch(setPendingPage(nextPage));

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


    const handleSend = useCallback(async (e) => {
        e.preventDefault();
        const hasText = inputText.trim().length > 0;
        const hasFile = !!selectedFile;
        if ((!hasText && !hasFile) || !activeChat || !socketActions || !isReady || isUploading) return;
        // --- XỬ LÝ FILE ---
        if (selectedFile) {
            try {
                const result = await uploadSelectedFile();
                if (!result) return;

                const prefix = result.type === 'video' ? '[VIDEO]' : '[IMAGE]';
                const fileMessage = `${prefix}${result.url}`;

                // --- OPTIMISTIC UI CHO FILE ---
                const tempId = Date.now().toString();
                const currentName = user?.name || user?.user || user?.username || localStorage.getItem('user_name') || 'Tôi';

                const optimisticFileMessage = {
                    name: currentName,
                    mes: fileMessage,
                    createAt: new Date().toISOString(),
                    to: activeChat.name,
                    type: (activeChat.type === 0 || activeChat.type === 'people') ? 'people' : 'room',
                    tempId: tempId
                };
                dispatch(addMessage(optimisticFileMessage));

                // Gửi file 
                socketActions.sendChat(activeChat.name, fileMessage, (activeChat.type === 0 || activeChat.type === 'people') ? 'people' : 'room');
            } catch (error) {
                // Error already handled in hook
                return;
            }
        }
        // --- XỬ LÝ TEXT 
        if (hasText) {
            // Encode Emoji 
            const encodedText = encodeEmoji ? encodeEmoji(inputText) : inputText;

            // Optimistic UI: Hiển thị ngay lập tức 
            const tempId = Date.now().toString();
            const currentName = user?.name || user?.user || user?.username || localStorage.getItem('user_name') || 'Tôi';

            const optimisticMessage = {
                name: currentName,
                mes: encodedText,
                createAt: new Date().toISOString(),
                to: activeChat.name,
                type: (activeChat.type === 0 || activeChat.type === 'people') ? 'people' : 'room',
                tempId: tempId
            };

            dispatch(addMessage(optimisticMessage));
            // Gửi socket
            if (activeChat.type === 0 || activeChat.type === 'people') {
                socketActions.sendChat(activeChat.name, encodedText, 'people');
            } else {
                socketActions.sendChat(activeChat.name, encodedText, 'room');
            }

            setInputText('');
        }
        // Scroll 
        requestAnimationFrame(() => {
            scrollToBottom('smooth');
        });
    }, [inputText, selectedFile, isUploading, activeChat, socketActions, isReady, scrollToBottom, handleRemoveFile, dispatch, user]);

    const handleAddMember = useCallback(async () => {
        // Logic được di chuyển sang AddMemberModal - chỉ giữ callback này để tương thích
        // ChatPage sẽ xử lý hiển thị modal
        return true;
    }, []);

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
        handleScroll, handleSend, handleAddMember, handleCreateRoom,
        // File props
        selectedFile, isUploading, handleSelectFile, handleRemoveFile
    };
};
