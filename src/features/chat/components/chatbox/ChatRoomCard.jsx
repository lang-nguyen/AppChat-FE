import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSocket } from '../../../../app/providers/SocketProvider';
import { clearChat } from '../../../../state/chat/chatSlice';

const ChatRoomCard = () => {
    const dispatch = useDispatch();
    const { actions } = useSocket();
    const { activeChat, messages, onlineStatus } = useSelector((state) => state.chat);
    const currentUser = useSelector((state) => state.auth.user);

    const myUsername = currentUser?.user || currentUser?.username || localStorage.getItem('user_name');

    const [inputText, setInputText] = useState('');
    const [page, setPage] = useState(1);
    const messagesEndRef = useRef(null);
    const chatContainerRef = useRef(null);
    const prevScrollHeightRef = useRef(0);

    useEffect(() => {
        if (activeChat) {
            dispatch(clearChat());
            setPage(1);
            fetchMessages(1);

            if (activeChat.type === 0 || activeChat.type === 'people') {
                actions.checkOnline(activeChat.name);
            }
        }
    }, [activeChat]);

    const fetchMessages = (pageNum) => {
        if (!activeChat) return;
        if (activeChat.type === 0 || activeChat.type === 'people') { // 0: people
            actions.chatHistory(activeChat.name, pageNum);
        } else {
            actions.roomHistory(activeChat.name, pageNum);
        }
    };

    const isOnline = activeChat &&
        (activeChat.type === 0 || activeChat.type === 'people') &&
        onlineStatus[activeChat.name];

    useEffect(() => {
        if (page === 1) {
            scrollToBottom();
        } else {
            if (chatContainerRef.current) {
                const newScrollHeight = chatContainerRef.current.scrollHeight;
                chatContainerRef.current.scrollTop = newScrollHeight - prevScrollHeightRef.current;
            }
        }
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

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

    const handleSend = (e) => {
        e.preventDefault();
        if (!inputText.trim() || !activeChat) return;

        if (activeChat.type === 0 || activeChat.type === 'people') {
            actions.sendChat(activeChat.name, inputText, 'people');
        } else {
            actions.sendChat(activeChat.name, inputText, 'room');
        }
        setInputText('');
    };

    if (!activeChat) return null;

    return (
        <div style={styles.container}>
            {/* Header */}
            <div style={styles.header}>
                <div style={styles.avatarContainer}>
                    <img
                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(activeChat.name)}&background=random&size=128`}
                        alt={activeChat.name}
                        style={styles.avatar}
                    />
                    {isOnline && <div style={styles.onlineDot} />}
                </div>
                <div style={styles.headerInfo}>
                    <h3 style={styles.title}>{activeChat.name}</h3>
                    <span style={{
                        ...styles.status,
                        color: isOnline ? '#4CAF50' : '#888'
                    }}>
                        {(activeChat.type === 1 || activeChat.type === 'group' || activeChat.type === 'room')
                            ? 'Group Chat'
                            : (isOnline ? 'Online' : 'Offline')}
                    </span>
                </div>
            </div>

            {/* Messages Area */}
            <div
                style={styles.messagesArea}
                ref={chatContainerRef}
                onScroll={handleScroll}
            >
                {page > 1 && <div style={styles.loader}>Loading more...</div>}

                {messages.map((msg, index) => {
                    const isMe = msg.name === myUsername;
                    return (
                        <div
                            key={index}
                            style={{
                                ...styles.messageRow,
                                justifyContent: isMe ? 'flex-end' : 'flex-start'
                            }}
                        >
                            {!isMe && (
                                <img
                                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(msg.name)}&background=random&size=32`}
                                    alt={msg.name}
                                    style={styles.smallAvatar}
                                />
                            )}
                            <div style={{
                                ...styles.bubble,
                                backgroundColor: isMe ? '#007AFF' : '#fff',
                                color: isMe ? '#fff' : '#333',
                                borderBottomRightRadius: isMe ? 4 : 20,
                                borderBottomLeftRadius: isMe ? 20 : 4,
                                boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                            }}>
                                {!isMe && <div style={styles.senderName}>{msg.name}</div>}
                                <div>{msg.mes}</div>
                                <div style={{
                                    ...styles.timestamp,
                                    color: isMe ? 'rgba(255,255,255,0.7)' : '#999'
                                }}>
                                    {msg.createAt || ''}
                                </div>
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form style={styles.inputArea} onSubmit={handleSend}>
                <input
                    type="text"
                    style={styles.input}
                    placeholder="Type a message..."
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                />
                <button type="submit" style={styles.sendButton}>
                    Send
                </button>
            </form>
        </div>
    );
};

// CSS Styles
const styles = {
    container: {
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: '#fff',
        borderRadius: '16px',
        overflow: 'hidden',
        boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
        fontFamily: "'Inter', sans-serif",
    },
    header: {
        padding: '16px 24px',
        borderBottom: '1px solid #f0f0f0',
        display: 'flex',
        alignItems: 'center',
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        zIndex: 10,
    },
    avatarContainer: {
        position: 'relative',
        marginRight: '16px',
    },
    avatar: {
        width: '48px',
        height: '48px',
        borderRadius: '50%',
        objectFit: 'cover',
    },
    onlineDot: {
        position: 'absolute',
        bottom: '2px',
        right: '2px',
        width: '12px',
        height: '12px',
        borderRadius: '50%',
        backgroundColor: '#4CAF50',
        border: '2px solid #fff',
    },
    headerInfo: {
        display: 'flex',
        flexDirection: 'column',
    },
    title: {
        margin: 0,
        fontSize: '18px',
        fontWeight: '600',
        color: '#333',
    },
    status: {
        fontSize: '13px',
        marginTop: '4px',
    },
    messagesArea: {
        flex: 1,
        padding: '20px',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        backgroundColor: '#F9FAFB',
    },
    loader: {
        textAlign: 'center',
        color: '#999',
        fontSize: '12px',
        padding: '10px',
    },
    messageRow: {
        display: 'flex',
        alignItems: 'flex-end',
        gap: '8px',
    },
    smallAvatar: {
        width: '28px',
        height: '28px',
        borderRadius: '50%',
        marginBottom: '4px',
    },
    bubble: {
        maxWidth: '70%',
        padding: '12px 16px',
        borderRadius: '20px',
        fontSize: '15px',
        lineHeight: '1.4',
        position: 'relative',
        wordBreak: 'break-word',
    },
    senderName: {
        fontSize: '11px',
        fontWeight: 'bold',
        marginBottom: '4px',
        opacity: 0.7,
        color: '#555',
    },
    timestamp: {
        fontSize: '10px',
        marginTop: '6px',
        textAlign: 'right',
    },
    inputArea: {
        padding: '20px',
        borderTop: '1px solid #f0f0f0',
        display: 'flex',
        gap: '12px',
        backgroundColor: '#fff',
    },
    input: {
        flex: 1,
        padding: '12px 20px',
        borderRadius: '24px',
        border: '1px solid #e0e0e0',
        fontSize: '15px',
        outline: 'none',
        transition: 'border-color 0.2s',
        backgroundColor: '#f5f5f5',
    },
    sendButton: {
        padding: '12px 24px',
        borderRadius: '24px',
        border: 'none',
        backgroundColor: '#007AFF',
        color: '#fff',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'background-color 0.2s',
    }
};

export default ChatRoomCard;
