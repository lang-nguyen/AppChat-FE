import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSocket } from '../../../../app/providers/SocketProvider';
import { setMessages } from '../../../../state/chat/chatSlice';
import styles from './ChatRoomCard.module.css';

const ChatRoomCard = ({ onInfoClick }) => {
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
            dispatch(setMessages([]));
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

    // Hàm helper để parse thời gian
    const parseTime = (timeStr) => {
        if (!timeStr) return new Date();
        return new Date(timeStr);
    };

    // Logic gộp timestamp (15 phút)
    const shouldShowTimestamp = (currentMsg, prevMsg) => {
        if (!prevMsg) return true;
        const currentTime = parseTime(currentMsg.createAt);
        const prevTime = parseTime(prevMsg.createAt);
        const diffMinutes = (currentTime - prevTime) / 1000 / 60;
        return diffMinutes > 15;
    };

    const formatTimeFull = (timeStr) => {
        const date = parseTime(timeStr);
        return date.toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    if (!activeChat) return null;

    return (
        <div className={styles.container}>
            {/* Phần Header */}
            <div className={styles.header}>
                <div className={styles.headerLeft}>
                    <div className={styles.avatarContainer}>
                        <img
                            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(activeChat.name)}&background=random&size=128`}
                            alt={activeChat.name}
                            className={styles.avatar}
                        />
                        {(activeChat.type === 0 || activeChat.type === 'people') && (
                            <div className={isOnline ? styles.onlineDot : styles.offlineDot} />
                        )}
                    </div>
                    <div className={styles.headerInfo}>
                        <h3 className={styles.title}>{activeChat.name}</h3>
                    </div>
                </div>

                <div className={styles.headerRight}>
                    <button className={styles.iconButton}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                        </svg>
                    </button>
                    <button className={styles.iconButton} onClick={onInfoClick}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="1"></circle>
                            <circle cx="19" cy="12" r="1"></circle>
                            <circle cx="5" cy="12" r="1"></circle>
                        </svg>
                    </button>
                </div>
            </div>

            <div
                className={styles.messagesArea}
                ref={chatContainerRef}
                onScroll={handleScroll}
            >
                {page > 1 && <div className={styles.loader}>Đang tải thêm...</div>}

                {messages.map((msg, index) => {
                    const isMe = msg.name === myUsername;
                    const prevMsg = index > 0 ? messages[index - 1] : null;
                    const showTime = shouldShowTimestamp(msg, prevMsg);

                    return (
                        <div key={index} className={styles.messageRow}>
                            {showTime && (
                                <div className={styles.centerTimestamp}>
                                    {formatTimeFull(msg.createAt)}
                                </div>
                            )}

                            <div className={styles.messageContent} style={{ flexDirection: isMe ? 'row-reverse' : 'row', alignItems: 'flex-start' }}>
                                {/* Avatar và tên người gửi (nếu không phải mình) */}
                                {!isMe && (
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 64 }}>
                                        <div style={{ position: 'relative' }}>
                                            <img
                                                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(msg.name)}&background=random&size=32`}
                                                alt={msg.name}
                                                className={styles.smallAvatar}
                                            />
                                            <div className={styles.onlineDot} style={{ width: 8, height: 8, bottom: 2, right: 0 }} />
                                        </div>
                                        <span className={styles.senderName} style={{ margin: '2px 0 0 0', textAlign: 'center', width: '100%', fontSize: 10 }}>{msg.name}</span>
                                    </div>
                                )}

                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start', maxWidth: '70%', marginTop: !isMe ? 0 : 0 }}>
                                    <div className={styles.bubble} style={{
                                        backgroundColor: isMe ? '#FF5596' : '#fff',
                                        color: isMe ? '#fff' : '#000',
                                        borderRadius: 20,
                                        borderBottomRightRadius: isMe ? 4 : 20,
                                        borderBottomLeftRadius: isMe ? 20 : 4,
                                    }}>
                                        {msg.mes}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* Khu vực nhập tin nhắn */}
            <form className={styles.inputArea} onSubmit={handleSend}>
                <div className={styles.inputContainer}>
                    {/* Icon Smile */}
                    <button type="button" className={styles.actionButton}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M8 14s1.5 2 4 2 4-2 4-2"></path><line x1="9" y1="9" x2="9.01" y2="9"></line><line x1="15" y1="9" x2="15.01" y2="9"></line></svg>
                    </button>

                    <input
                        type="text"
                        className={styles.input}
                        placeholder="Soạn tin nhắn"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                    />

                    {/* Icon Mic */}
                    <button type="button" className={styles.actionButton}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>
                    </button>
                    {/* Icon Image */}
                    <button type="button" className={styles.actionButton}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                    </button>
                    {/* Icon Sticker (Smiley Square) */}
                    <button type="button" className={styles.actionButton}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path><path d="M21 3v5h-5"></path><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path><path d="M8 16H3v5"></path></svg>
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ChatRoomCard;
