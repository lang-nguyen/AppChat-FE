import React, { useState, useMemo } from 'react';
import colors from '../../../../shared/constants/colors';
import ImageModal from '../../../../shared/components/ImageModal';

// Hàm định dạng lại ngày tháng năm để hiển thị cho đẹp
const formatDateGroup = (isoString) => {
    if (!isoString) return 'Khác';
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return 'Khác';

    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `Ngày ${day}/${month}/${year}`;
};

const MediaGallery = ({ items = [], initialTab = 'image', onClose }) => {
    const [activeTab, setActiveTab] = useState(initialTab); // 'image', 'video', 'file'
    const [selectedImage, setSelectedImage] = useState(null);

    // Lọc item dựa trên tab đang chọn
    const filteredItems = useMemo(() => {
        return items.filter(item => item.type === activeTab);
    }, [items, activeTab]);

    // Gom nhóm item theo ngày
    const groupedItems = useMemo(() => {
        const groups = {};
        filteredItems.forEach(item => {
            const dateKey = formatDateGroup(item.createdAt); // createdAt phải tồn tại trong item
            if (!groups[dateKey]) {
                groups[dateKey] = [];
            }
            groups[dateKey].push(item);
        });
        return groups;
    }, [filteredItems]);

    const handleItemClick = (item) => {
        if (item.type === 'image') {
            setSelectedImage(item.url);
        } else if (item.type === 'video') {
            window.open(item.url, '_blank'); // có thể cai tien de hien thi ngay trong tab dang mo
        }
    };

    const renderTabs = () => (
        <div style={{ display: 'flex', borderBottom: '1px solid #ddd', backgroundColor: '#fff', padding: '0 16px' }}>
            {['image', 'video', 'file'].map(tab => {
                const isActive = activeTab === tab;
                const labels = { image: 'Hình ảnh', video: 'Video', file: 'Files' };
                return (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        style={{
                            flex: 1,
                            padding: '16px 0',
                            background: 'none',
                            border: 'none',
                            borderBottom: isActive ? `3px solid ${colors.primaryButton}` : '3px solid transparent',
                            color: isActive ? colors.primaryButton : colors.regularText,
                            fontWeight: isActive ? 600 : 400,
                            cursor: 'pointer',
                            fontSize: 15,
                            transition: 'all 0.2s',
                        }}
                    >
                        {labels[tab]}
                    </button>
                );
            })}
        </div>
    );

    const renderContent = () => {
        if (filteredItems.length === 0) {
            return (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#999' }}>
                    <div>Chưa có {activeTab === 'file' ? 'file' : 'dữ liệu'} nào</div>
                </div>
            );
        }

        return (
            <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
                {Object.entries(groupedItems).map(([date, groupItems]) => (
                    <div key={date} style={{ marginBottom: 24 }}>
                        <h4 style={{ margin: '0 0 12px 0', fontSize: 14, color: '#666', fontWeight: 600 }}>{date}</h4>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
                            gap: 8
                        }}>
                            {groupItems.map((item, idx) => (
                                <div
                                    key={idx}
                                    onClick={() => handleItemClick(item)}
                                    style={{
                                        position: 'relative',
                                        paddingTop: '100%',
                                        borderRadius: 6,
                                        overflow: 'hidden',
                                        cursor: 'pointer',
                                        backgroundColor: '#f5f5f5',
                                        border: '1px solid #eee'
                                    }}
                                >
                                    {item.type === 'image' ? (
                                        <img src={item.url} alt="media" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#000' }}>
                                            <video src={item.url} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.7 }} muted />
                                            <span style={{ position: 'absolute', color: '#fff', fontSize: 20 }}>▶</span>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: '#F5F7FA', zIndex: 2000,
            display: 'flex', flexDirection: 'column'
        }}>
            {/* Header */}
            <div style={{
                height: 60, backgroundColor: '#fff', display: 'flex', alignItems: 'center', padding: '0 16px',
                borderBottom: '1px solid #eee', boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
            }}>
                <button
                    onClick={onClose}
                    style={{ background: 'none', border: 'none', fontSize: 24, cursor: 'pointer', marginRight: 16, color: colors.normalText }}
                >
                    &lt;
                </button>
                <span style={{ fontSize: 18, fontWeight: 700, color: colors.primaryText }}>Kho lưu trữ</span>
            </div>

            {/* Tabs */}
            {renderTabs()}

            {/* Content */}
            {renderContent()}

            {/* Image Modal */}
            {selectedImage && <ImageModal imageUrl={selectedImage} onClose={() => setSelectedImage(null)} />}
        </div>
    );
};

export default MediaGallery;
