import React from 'react';
import { useSocket } from '../../app/providers/useSocket';
import Loading from './Loading';
import Button from './Button'; // Import Button
import colors from '../constants/colors'; // Import colors

const GlobalLoading = () => {
    const { isReady, connectionError, reconnect } = useSocket(); 

    if (isReady) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            height: '100vh',
            width: '100vw',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            backdropFilter: 'blur(5px)',
            WebkitBackdropFilter: 'blur(5px)'
        }}>
            {connectionError ? (
                // Giao diện hiển thị lỗi
                <div style={{
                    backgroundColor: 'white',
                    padding: '30px',
                    borderRadius: '16px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
                    textAlign: 'center',
                    maxWidth: '400px',
                    width: '90%'
                }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
                    <h3 style={{ margin: '0 0 10px 0', color: colors.errorText }}>Kết nối thất bại</h3>
                    <p style={{ color: '#666', marginBottom: '24px', lineHeight: '1.5' }}>
                        {connectionError}
                    </p>
                    <Button onClick={reconnect}>
                        Thử lại
                    </Button>
                </div>
            ) : (
                // Giao diện Loading
                <Loading text="Đang kết nối..." />
            )}
        </div>
    );
};

export default GlobalLoading;
