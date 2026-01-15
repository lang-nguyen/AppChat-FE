import React, { useEffect } from 'react';
import styles from './ImageModal.module.css';

const VideoModal = ({ videoUrl, onClose }) => {
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    if (!videoUrl) return null;

    return (
        <div className={styles.overlay} onClick={onClose}>
            <button className={styles.closeButton} onClick={onClose} title="Đóng (ESC)">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
            </button>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <video
                    src={videoUrl}
                    controls
                    autoPlay
                    className={styles.image}
                    style={{ maxHeight: '80vh', maxWidth: '90vw' }}
                />
            </div>
        </div>
    );
};

export default VideoModal;
