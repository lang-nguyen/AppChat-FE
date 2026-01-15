import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSocket } from "../../../app/providers/useSocket.js";
import { clearMessages, addMessage } from "../../../state/chat/chatSlice.js";
import { encodeEmoji } from "../../../shared/utils/emojiUtils.js";
import { uploadFile } from "../../../shared/services/cloudinaryService.js";
import { getAvatarUrl } from "../../../shared/utils/avatarUtils.js";

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

    // -- File Upload State --
    const [selectedFile, setSelectedFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);

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
                {
                    id: currentUserName, // Dùng tên làm ID
                    name: currentUserName,
                    avatar: getAvatarUrl(currentUserName),
                    isOnline: true
                },
                {
                    id: activeChat.name,
                    name: activeChat.name,
                    avatar: getAvatarUrl(activeChat.name),
                    isOnline: !!onlineStatus[activeChat.name]
                }
            ];
        } else {
            const roomData = people.find(p => p.name === activeChat.name && p.type === activeChat.type);
            const userList = roomData?.userList || [];
            return userList.map(m => {
                const name = typeof m === 'string' ? m : m.name;
                const isOwner = typeof m === 'object' ? m.isOwner : false;
                return {
                    id: name, // Dùng tên làm ID
                    name,
                    avatar: getAvatarUrl(name),
                    isOnline: !!onlineStatus[name],
                    isOwner
                };
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

            // Clear file đang chọn nếu có
            queueMicrotask(() => setSelectedFile(null));
            queueMicrotask(() => setIsUploading(false));

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

    // Effect: Khi mở phòng nhóm, tự động check trạng thái online của các thành viên
    useEffect(() => {
        if (!isReady || !activeChat) return;
        const isRoom = activeChat.type === 1 || activeChat.type === 'room' || activeChat.type === 'group';
        if (!isRoom) return;

        // Lấy danh sách tên thành viên và loại bỏ bản thân
        const names = (memberList || [])
            .map(m => m?.name)
            .filter(Boolean)
            .filter(n => n !== myUsername);

        if (names.length === 0) return;

        // Chỉ check những người chưa có trạng thái trong store để tránh spam
        const toCheck = [];
        const seen = new Set();
        for (const n of names) {
            if (!seen.has(n)) {
                seen.add(n);
                if (onlineStatus[n] === undefined) {
                    toCheck.push(n);
                }
            }
        }

        // Giới hạn số lượng mỗi lượt để nhẹ nhàng (ví dụ 10 người)
        const MAX_BATCH = 10;
        const batch = toCheck.slice(0, MAX_BATCH);

        // Gửi lần lượt với delay nhỏ để tránh nghẽn
        batch.forEach((username, index) => {
            setTimeout(() => {
                try {
                    socketActions.checkOnline(username);
                } catch (e) {
                    console.warn('checkOnline failed for', username, e);
                }
            }, index * 200); // 200ms giữa mỗi request
        });
    }, [isReady, activeChat, memberList, myUsername, socketActions, onlineStatus]);

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

    // -- File Handlers --
    const handleSelectFile = useCallback((e) => {
        const file = e.target.files[0];
        if (file) {
            // Gioi hạn duoi 50mb (ca anh va video)
            if (file.size > 50 * 1024 * 1024) {
                alert("File quá lớn! Vui lòng chọn file dưới 50MB.");
                return;
            }
            setSelectedFile(file);
        }
    }, []);

    const handleRemoveFile = useCallback(() => {
        setSelectedFile(null);
        // Reset value của input file (cần ref ở UI component)
        const fileInput = document.getElementById('chat-file-input');
        if (fileInput) fileInput.value = '';
    }, []);

    const handleSend = useCallback(async (e) => {
        e.preventDefault();
        const hasText = inputText.trim().length > 0;
        const hasFile = !!selectedFile;
        if ((!hasText && !hasFile) || !activeChat || !socketActions || !isReady || isUploading) return;
        // --- XỬ LÝ FILE ---
        if (hasFile) {
            setIsUploading(true);
            try {
                const result = await uploadFile(selectedFile);
                const prefix = result.type === 'video' ? '[VIDEO]' : '[IMAGE]';
                const fileMessage = `${prefix}${result.url}`;

                // --- OPTIMISTIC UI CHO FILE ---
                // Hiển thị ngay sau khi upload xong (có URL thật), không cần đợi socket vòng về
                const tempId = Date.now().toString();
                const currentName = user?.name || user?.user || user?.username || localStorage.getItem('user_name') || 'Tôi';

                const optimisticFileMessage = {
                    name: currentName,
                    mes: fileMessage, // "[IMAGE]url" hoặc "[VIDEO]url"
                    createAt: new Date().toISOString(),
                    to: activeChat.name,
                    type: (activeChat.type === 0 || activeChat.type === 'people') ? 'people' : 'room',
                    tempId: tempId
                };
                dispatch(addMessage(optimisticFileMessage));
                // ------------------------------

                // Gửi file 
                if (activeChat.type === 0 || activeChat.type === 'people') {
                    socketActions.sendChat(activeChat.name, fileMessage, 'people');
                } else {
                    socketActions.sendChat(activeChat.name, fileMessage, 'room');
                }

                // Clear file
                handleRemoveFile();
            } catch (error) {
                console.error("Upload thất bại:", error);
                alert("Gửi file thất bại. Vui lòng thử lại.");
                setIsUploading(false);
                return;
            } finally {
                setIsUploading(false);
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
