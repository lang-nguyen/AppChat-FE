import React, { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import colors from '../../../../shared/constants/colors';
import MediaGallery from './MediaGallery';
import ImageModal from '../../../../shared/components/ImageModal';

const SharedMedia = () => {
    const messages = useSelector(state => state.chat.messages);
    const [showGallery, setShowGallery] = useState(false);
    const [galleryTab, setGalleryTab] = useState('image'); // Default tab 
    const [selectedImage, setSelectedImage] = useState(null);

    // Tách ảnh/video kèm thời gian từ tin nhắn
    const mediaList = useMemo(() => {
        const list = [];
        // Lay tin nhan moi nhat de hien o dau list
        [...messages].reverse().forEach(msg => {
            if (!msg.mes) return;
            const content = msg.mes;
            // list image
            if (content.startsWith('[IMAGE]')) {
                list.push({
                    type: 'image',
                    url: content.replace('[IMAGE]', ''),
                    id: msg.id || msg.tempId,
                    createdAt: msg.createAt || new Date().toISOString()
                });
                // list video
            } else if (content.startsWith('[VIDEO]')) {
                list.push({
                    type: 'video',
                    url: content.replace('[VIDEO]', ''),
                    id: msg.id || msg.tempId,
                    createdAt: msg.createAt || new Date().toISOString()
                });
            }
        });
        return list;
    }, [messages]);

    // Preview: Lấy 8 item mới nhất (image va video)
    const previewItems = useMemo(() => mediaList.slice(0, 8), [mediaList]);

    const handleItemClick = (item) => {
        if (item.type === 'image') {
            setSelectedImage(item.url);
        } else if (item.type === 'video') {
            window.open(item.url, '_blank');
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
            {mediaList.length > 0 && (
                <button
                    onClick={() => setShowGallery(true)}
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

            {/* Modal */}
            {/* Khi bam xem tat ca thi mo MediaGallery */}
            {showGallery && (
                <MediaGallery
                    items={mediaList}
                    onClose={() => setShowGallery(false)}
                />
            )}

            {/* Image Modal */}
            {selectedImage && <ImageModal imageUrl={selectedImage} onClose={() => setSelectedImage(null)} />}
        </div>
    );
};

export default SharedMedia;
