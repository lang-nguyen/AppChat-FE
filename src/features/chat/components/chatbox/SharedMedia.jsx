import React, { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import colors from '../../../../shared/constants/colors';
import MediaGallery from './MediaGallery';
import ImageModal from '../../../../shared/components/ImageModal';
import VideoModal from '../../../../shared/components/VideoModal';

const SharedMedia = ({ items = [], onViewAll }) => { // Nhận items từ ChatInfo
    const [selectedImage, setSelectedImage] = useState(null);
    const [previewVideo, setPreviewVideo] = useState(null);

    // Preview: Lấy 8 item mới nhất (image va video)
    const previewItems = useMemo(() => items.slice(0, 8), [items]);

    const handleItemClick = (item) => {
        if (item.type === 'image') {
            setSelectedImage(item.url);
        } else if (item.type === 'video') {
            setPreviewVideo(item.url);
        }
    };

    return (
        <div style={{ padding: '0 16px', marginTop: 16 }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span style={{ fontWeight: 600, fontSize: 15, color: colors.primaryText }}>Kho lưu trữ</span>
            </div>

            {/* Grid Preview */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: 4,
                marginBottom: 12
            }}>
                {previewItems.map((item, index) => (
                    <div
                        key={index}
                        onClick={() => handleItemClick(item)}
                        style={{
                            position: 'relative',
                            paddingTop: '100%',
                            borderRadius: 4,
                            overflow: 'hidden',
                            backgroundColor: '#f0f0f0',
                            border: '1px solid #e0e0e0',
                            cursor: 'pointer'
                        }}
                    >
                        {item.type === 'image' ? (
                            <img
                                src={item.url}
                                alt="thumb"
                                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                        ) : (
                            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
                                <video
                                    src={item.url}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    muted
                                />
                                <div style={{ // Icon Play nhỏ
                                    position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                                    fontSize: 10, color: '#fff', textShadow: '0 0 2px black'
                                }}>▶</div>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Nếu chưa có media */}
            {previewItems.length === 0 && (
                <div style={{ fontSize: 13, color: '#888', fontStyle: 'italic', marginBottom: 12 }}>Chưa có ảnh/video</div>
            )}

            {/* Button Xem tất cả */}
            {items.length > 0 && (
                <button
                    onClick={onViewAll}
                    style={{
                        width: '100%',
                        padding: '10px 0',
                        textAlign: 'center',
                        backgroundColor: '#EFEFEF',
                        border: 'none',
                        borderRadius: 4,
                        color: colors.primaryText,
                        fontWeight: 600,
                        fontSize: 14,
                        cursor: 'pointer',
                        transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e5e5e5'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#EFEFEF'}
                >
                    Xem tất cả
                </button>
            )}
            {/* Image & Video Modal */}
            {selectedImage && <ImageModal imageUrl={selectedImage} onClose={() => setSelectedImage(null)} />}
            {previewVideo && <VideoModal videoUrl={previewVideo} onClose={() => setPreviewVideo(null)} />}
        </div>
    );
};

export default SharedMedia;
