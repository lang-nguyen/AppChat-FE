import React from 'react';
import styles from './ChatRoomCard.module.css';
import Loading from '../../../../shared/components/Loading';

const ChatRoomCard = ({
    activeChat,
    messages,
    myUsername,
    isOnline,
    inputText,
    setInputText,
    page,
    isLoading,
    handleSend,
    handleScroll,
    messagesEndRef,
    chatContainerRef,
    onInfoClick
}) => {

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
                    <button className={styles.iconButton} title="Gọi">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                        </svg>
                    </button>
                    <button className={styles.iconButton} onClick={onInfoClick} title="Thông tin">
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
                {/* Loader ở đầu danh sách khi load more */}
                {isLoading && page > 1 && (
                    <div style={{ padding: '10px', textAlign: 'center' }}>
                        <Loading text="Đang tải thêm tin nhắn..." />
                    </div>
                )}

                {messages.length === 0 && !isLoading && (
                    <div className={styles.loader} style={{ padding: '40px 0' }}>
                        Chưa có tin nhắn trong cuộc hội thoại này.
                    </div>
                )}

                {messages.length === 0 && isLoading && page === 1 && (
                    <div style={{ padding: '40px 0', textAlign: 'center' }}>
                        <Loading text="Đang tải tin nhắn..." />
                    </div>
                )}

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
                                        </div>
                                        <span className={styles.senderName} style={{ margin: '2px 0 0 0', textAlign: 'center', width: '100%', fontSize: 10 }}>{msg.name}</span>
                                    </div>
                                )}

                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start' }}>
                                    <div className={styles.bubble} style={{
                                        backgroundColor: isMe ? '#FF5596' : '#fff',
                                        color: isMe ? '#fff' : '#000',
                                    }}>
                                        {msg.mes}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} style={{ height: 1, width: '100%' }} />
            </div>

            {/* Khu vực nhập tin nhắn */}
            <form className={styles.inputArea} onSubmit={handleSend}>
                <div className={styles.inputContainer}>
                    {/* Emoji icon */}
                    <button type="button" className={styles.actionButton} title="Emoji">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M8 14s1.5 2 4 2 4-2 4-2"></path><line x1="9" y1="9" x2="9.01" y2="9"></line><line x1="15" y1="9" x2="15.01" y2="9"></line></svg>
                    </button>

                    <input
                        type="text"
                        className={styles.input}
                        placeholder="Soạn tin nhắn..."
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                    />

                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        {/* Mic icon */}
                        <button type="button" className={styles.actionButton} title="Ghi âm">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>
                        </button>
                        {/* Image icon */}
                        <button type="button" className={styles.actionButton} title="Đính kèm ảnh">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                        </button>
                        {/* Sticker icon - Updated to Smiley Sticker icon */}
                        <button type="button" className={styles.actionButton} title="Stickers">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-6.21-8.58"></path><path d="M15 3.5V8a1 1 0 0 0 1 1h4.5"></path><path d="M21 12a9 9 0 0 1-9 9"></path><path d="M9 10h.01"></path><path d="M15 10h.01"></path><path d="M9 15c.66 1 1.66 2 3 2s2.34-1 3-2"></path></svg>
                        </button>
                    </div>
                </div>
                {/* Nút gửi tin nhắn */}
                <button type="submit" className={styles.sendButton} title="Gửi (Enter)" disabled={!inputText.trim()}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="22" y1="2" x2="11" y2="13"></line>
                        <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                    </svg>
                </button>
            </form>
        </div>
    );
};

export default ChatRoomCard;
