import React from 'react';
import colors from '../../../../shared/constants/colors.js';

const InfoFunction = ({ isGroup = false, onRename, onChangeTheme, onLeaveRoom }) => (
    <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* Đổi tên phòng chat */}
        <button onClick={onRename} style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: 12,
            backgroundColor: '#fff',
            border: 'none',
            borderRadius: 8,
            cursor: 'pointer',
            fontSize: 15,
            color: colors.normalText
        }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            Đổi tên phòng chat
        </button>

        {/* Đổi chủ đề */}
        <button onClick={onChangeTheme} style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: 12,
            backgroundColor: '#fff',
            border: 'none',
            borderRadius: 8,
            cursor: 'pointer',
            fontSize: 15,
            color: colors.normalText
        }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 2a7 7 0 1 0 10 10" />
            </svg>
            Đổi chủ đề
        </button>

        {/* Rời khỏi phòng chat */}
        {isGroup && (
            <button onClick={onLeaveRoom} style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: 12,
	            backgroundColor: '#fff',
                border: 'none',
                borderRadius: 8,
                cursor: 'pointer',
                fontSize: 15,
                color: colors.errorText,
            }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                Rời khỏi phòng chat
            </button>
        )}
    </div>
);

export default InfoFunction;
