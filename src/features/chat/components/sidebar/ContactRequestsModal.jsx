import React from 'react';
import ContactRequestsHeader from './ContactRequestsHeader';
import colors from '../../../../shared/constants/colors';

const ContactRequestsModal = ({ onClose, onSelectUser }) => {
    // TODO: Lấy danh sách từ backend khi có API
    const pendingContacts = []; // Tạm thời để trống

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
                {pendingContacts.length === 0 ? (
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
                    pendingContacts.map((contact) => (
                        <div
                            key={contact.id || contact.name}
                            onClick={() => {
                                if (onSelectUser) {
                                    onSelectUser(contact.name);
                                    onClose();
                                }
                            }}
                            style={{
                                padding: '12px 16px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 12,
                                cursor: 'pointer',
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
                                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(contact.name)}&background=random&size=128`}
                                    alt={contact.name}
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
                                    {contact.name}
                                </div>
                                {contact.lastMessage && (
                                    <div style={{
                                        fontSize: 13,
                                        color: colors.normalText,
                                        opacity: 0.7,
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis'
                                    }}>
                                        {contact.lastMessage}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default ContactRequestsModal;


