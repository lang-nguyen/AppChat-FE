import React from 'react';
import Button from '../../../../shared/components/Button';
import colors from '../../../../shared/constants/colors';

const SearchResult = ({ searchQuery, onContact }) => {
    return (
        <div style={{
            padding: '40px 16px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 16,
            flex: 1,
            minHeight: 0
        }}>
            <div style={{
                fontSize: 15,
                color: colors.primaryText, // Màu dark magenta #7A003C
                textAlign: 'center',
                fontWeight: 500
            }}>
                Bạn chưa liên hệ với người dùng này
            </div>
            <Button
                onClick={() => onContact(searchQuery)}
                style={{
                    width: 'auto',
                    minWidth: '120px',
                    padding: '10px 24px',
                    backgroundColor: colors.primaryButton, // Màu dark magenta #7A003C
                    borderRadius: 8,
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' // Shadow nhẹ
                }}
            >
                Liên hệ
            </Button>
        </div>
    );
};

export default SearchResult;

