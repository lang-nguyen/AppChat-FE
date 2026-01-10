import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import ContactRequestsHeader from './ContactRequestsHeader';
import { useApi } from '../../../../app/providers/useApi';
import { useSocket } from '../../../../app/providers/useSocket';
import { setPendingConversations, removePendingConversation } from '../../../../state/chat/chatSlice';
import colors from '../../../../shared/constants/colors';

const ContactRequestsModal = ({ onClose, onSelectUser }) => {
    const { actions: apiActions } = useApi();
    const { actions: socketActions } = useSocket();
    const dispatch = useDispatch();
    const user = useSelector((s) => s.auth.user);
    const pendingContacts = useSelector((s) => s.chat.pendingConversations);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetchPendingContacts = async () => {
            const username = user?.user || user?.username || localStorage.getItem('user_name');
            if (!username) return;

            setIsLoading(true);
            try {
                const data = await apiActions.getIncomingPendingConversations(username);
                const pendingList = data
                    .filter(item => item.status === 'PENDING')
                    .map(item => ({
                        username: item.username,
                        name: item.username,
                        status: item.status,
                        createdAt: item.createdAt,
                    }));
                dispatch(setPendingConversations(pendingList));
            } catch (err) {
                console.error('Failed to fetch pending contacts:', err);
                dispatch(setPendingConversations([]));
            } finally {
                setIsLoading(false);
            }
        };

        fetchPendingContacts();
    }, [apiActions, user, dispatch]);

    const handleAccept = async (fromUsername, e) => {
        e.stopPropagation();
        try {
            await apiActions.acceptPendingConversation(fromUsername);
            console.log('Đã accept pending conversation:', fromUsername);
            dispatch(removePendingConversation({ username: fromUsername }));
            
            // Gửi tin nhắn tới người đó để họ xuất hiện trong danh sách
            socketActions.sendChat(fromUsername, "Đã chấp nhận yêu cầu liên hệ", "people");
            console.log('Đã gửi tin nhắn accept tới:', fromUsername);
            
            // Refresh user list sau khi gửi tin nhắn
            // Delay để đảm bảo server đã xử lý tin nhắn và cập nhật danh sách
            setTimeout(() => {
                console.log('Refresh user list lần 1');
                socketActions.getUserList();
            }, 500);
            setTimeout(() => {
                console.log('Refresh user list lần 2');
                socketActions.getUserList();
            }, 1500);
            
            if (onSelectUser) {
                onSelectUser(fromUsername);
                onClose();
            }
        } catch (err) {
            console.error('Failed to accept pending conversation:', err);
        }
    };

    const handleDelete = async (fromUsername, e) => {
        e.stopPropagation();
        try {
            await apiActions.deletePendingConversation(fromUsername);
            dispatch(removePendingConversation({ username: fromUsername }));
        } catch (err) {
            console.error('Failed to delete pending conversation:', err);
        }
    };

    return (
        <div style={{
            height: '100%',
            maxHeight: '100%',
            minHeight: 0,
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: 'var(--card-bg)',
            width: '100%',
            boxSizing: 'border-box',
            overflow: 'hidden'
        }}>
            <ContactRequestsHeader onClose={onClose} />
            
            {/* Danh sách yêu cầu liên hệ */}
            <div style={{ 
                flex: 1, 
                minHeight: 0, 
                overflowY: 'auto',
                padding: '8px 0'
            }}>
                {isLoading ? (
                    <div style={{
                        padding: '40px 16px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: colors.normalText,
                        fontSize: 14,
                        textAlign: 'center'
                    }}>
                        Đang tải...
                    </div>
                ) : pendingContacts.length === 0 ? (
                    <div style={{
                        padding: '40px 16px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: colors.normalText,
                        fontSize: 14,
                        textAlign: 'center'
                    }}>
                        Chưa có yêu cầu liên hệ nào
                    </div>
                ) : (
                    pendingContacts.map((contact) => {
                        const contactName = contact.username || contact.name || 'Unknown';
                        return (
                            <div
                                key={contactName}
                                style={{
                                    padding: '12px 16px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 12,
                                    borderBottom: '1px solid #f0f0f0'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = '#f5f5f5';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                }}
                            >
                                <div style={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: '50%',
                                    backgroundColor: '#ddd',
                                    overflow: 'hidden',
                                    flexShrink: 0
                                }}>
                                    <img
                                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(contactName)}&background=random&size=128`}
                                        alt={contactName}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{
                                        fontSize: 15,
                                        fontWeight: 600,
                                        color: colors.primaryText,
                                        marginBottom: 4,
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis'
                                    }}>
                                        {contactName}
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                                    <button
                                        onClick={(e) => handleAccept(contactName, e)}
                                        style={{
                                            padding: '6px 12px',
                                            backgroundColor: colors.primary || '#007bff',
                                            color: '#fff',
                                            border: 'none',
                                            borderRadius: 6,
                                            cursor: 'pointer',
                                            fontSize: 12,
                                            fontWeight: 500
                                        }}
                                    >
                                        Chấp nhận
                                    </button>
                                    <button
                                        onClick={(e) => handleDelete(contactName, e)}
                                        style={{
                                            padding: '6px 12px',
                                            backgroundColor: '#dc3545',
                                            color: '#fff',
                                            border: 'none',
                                            borderRadius: 6,
                                            cursor: 'pointer',
                                            fontSize: 12,
                                            fontWeight: 500
                                        }}
                                    >
                                        Từ chối
                                    </button>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default ContactRequestsModal;


