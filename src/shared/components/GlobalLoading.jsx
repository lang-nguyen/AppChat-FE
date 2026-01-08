import React from 'react';
import { useSocket } from '../../app/providers/useSocket';
import Loading from './Loading';

const GlobalLoading = () => {
    const { isReady } = useSocket();

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
            <Loading text="Đang kết nối..." />
        </div>
    );
};

export default GlobalLoading;
