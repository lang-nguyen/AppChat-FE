import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSocket } from '../../../../app/providers/SocketProvider';
import { clearChat } from '../../../../state/chat/chatSlice';
import styles from './ChatRoomCard.module.css';

const ChatRoomCard = () => {
    const dispatch = useDispatch();
    const { actions } = useSocket();
    const { activeChat, messages, onlineStatus } = useSelector((state) => state.chat);
    const currentUser = useSelector((state) => state.auth.user);

    // Lấy username hiện tại để xác định tin nhắn của mình
    const myUsername = currentUser?.user || currentUser?.username || localStorage.getItem('user_name');

    const [inputText, setInputText] = useState('');
    const [page, setPage] = useState(1);
    const messagesEndRef = useRef(null);
    const chatContainerRef = useRef(null);
    const prevScrollHeightRef = useRef(0);

    // Khi activeChat thay đổi -> Reset và load lịch sử mới
    useEffect(() => {
        if (activeChat) {
            dispatch(clearChat());
            setPage(1);
            fetchMessages(1);

            // Kiểm tra trạng thái online nếu là chat 1-1
            if (activeChat.type === 0 || activeChat.type === 'people') {
                actions.checkOnline(activeChat.name);
            }
        }
    }, [activeChat]);

    // Hàm gọi API lấy lịch sử chat
    const fetchMessages = (pageNum) => {
        if (!activeChat) return;
        if (activeChat.type === 0 || activeChat.type === 'people') { // 0: người dùng
            actions.chatHistory(activeChat.name, pageNum);
        } else { // 1: nhóm
            actions.roomHistory(activeChat.name, pageNum);
        }
    };

    const isOnline = activeChat &&
        (activeChat.type === 0 || activeChat.type === 'people') &&
        onlineStatus[activeChat.name];

    // Auto scroll xuống cuối khi trang đầu tiên được load hoặc tin nhắn mới
    useEffect(() => {
        if (page === 1) {
            scrollToBottom();
        } else {
            // Nếu load trang cũ hơn, giữ vị trí scroll
            if (chatContainerRef.current) {
                const newScrollHeight = chatContainerRef.current.scrollHeight;
                chatContainerRef.current.scrollTop = newScrollHeight - prevScrollHeightRef.current;
            }
        }
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    // Xử lý scroll để load thêm tin nhắn cũ (Infinite Scroll)
    const handleScroll = () => {
        if (chatContainerRef.current) {
            const { scrollTop } = chatContainerRef.current;
            if (scrollTop === 0) {
                loadMore();
            }
        }
    };

    const loadMore = () => {
        if (chatContainerRef.current) {
            prevScrollHeightRef.current = chatContainerRef.current.scrollHeight;
        }
        const nextPage = page + 1;
        setPage(nextPage);
        fetchMessages(nextPage);
    };

    // Xử lý gửi tin nhắn
    const handleSend = (e) => {
        e.preventDefault();
        if (!inputText.trim() || !activeChat) return;

        // Gửi qua socket
        if (activeChat.type === 0 || activeChat.type === 'people') {
            actions.sendChat(activeChat.name, inputText, 'people');
        } else {
            actions.sendChat(activeChat.name, inputText, 'room');
        }
        setInputText('');
    };

    if (!activeChat) return null;

    return (
        <div className={styles.container}>
            {/* Phần Header: Tên và trạng thái */}
            <div className={styles.header}>
                <div className={styles.avatarContainer}>
                    <img
                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(activeChat.name)}&background=random&size=128`}
                        alt={activeChat.name}
                        className={styles.avatar}
                    />
                    {isOnline && <div className={styles.onlineDot} />}
                </div>
                <div className={styles.headerInfo}>
                    <h3 className={styles.title}>{activeChat.name}</h3>
                    <span className={styles.status} style={{ color: isOnline ? '#4CAF50' : '#888' }}>
                        {(activeChat.type === 1 || activeChat.type === 'group' || activeChat.type === 'room')
                            ? 'Nhóm Chat'
                            : (isOnline ? 'Đang hoạt động' : 'Ngoại tuyến')}
                    </span>
                </div>
            </div>

            {/* Khu vực hiển thị tin nhắn */}
            <div
                className={styles.messagesArea}
                ref={chatContainerRef}
                onScroll={handleScroll}
            >
                {page > 1 && <div className={styles.loader}>Đang tải thêm...</div>}

                {messages.map((msg, index) => {
                    // Xác định tin nhắn là của mình hay người khác
                    const isMe = msg.name === myUsername;
                    return (
                        <div
                            key={index}
                            className={styles.messageRow}
                            style={{ justifyContent: isMe ? 'flex-end' : 'flex-start' }}
                        >
                            {!isMe && (
                                <img
                                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(msg.name)}&background=random&size=32`}
                                    alt={msg.name}
                                    className={styles.smallAvatar}
                                />
                            )}
                            <div className={styles.bubble} style={{
                                backgroundColor: isMe ? '#007AFF' : '#fff',
                                color: isMe ? '#fff' : '#333',
                                borderBottomRightRadius: isMe ? 4 : 20,
                                borderBottomLeftRadius: isMe ? 20 : 4,
                                boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                            }}>
                                {!isMe && <div className={styles.senderName}>{msg.name}</div>}
                                <div>{msg.mes}</div>
                                <div className={styles.timestamp} style={{ color: isMe ? 'rgba(255,255,255,0.7)' : '#999' }}>
                                    {msg.createAt || ''}
                                </div>
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* Khu vực nhập tin nhắn */}
            <form className={styles.inputArea} onSubmit={handleSend}>
                <input
                    type="text"
                    className={styles.input}
                    placeholder="Nhập tin nhắn..."
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                />
                <button type="submit" className={styles.sendButton}>
                    Gửi
                </button>
            </form>
        </div>
    );
};

export default ChatRoomCard;
