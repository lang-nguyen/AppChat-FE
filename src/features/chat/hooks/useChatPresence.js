import { useEffect } from 'react';

/**
 * Hook chuyên biệt xử lý check online status cho thành viên trong nhóm
 */
export const useChatPresence = (isReady, activeChat, memberList, myUsername, onlineStatus, socketActions) => {
    useEffect(() => {
        if (!isReady || !activeChat) return;

        const isRoom = activeChat.type === 1 || activeChat.type === 'room' || activeChat.type === 'group';
        if (!isRoom) return;

        // Lấy danh sách tên thành viên và loại bỏ bản thân
        const names = (memberList || [])
            .map(m => m?.name)
            .filter(Boolean)
            .filter(n => n !== myUsername);

        if (names.length === 0) return;

        // Chỉ check những người chưa có trạng thái trong store để tránh spam
        const toCheck = [];
        const seen = new Set();
        for (const n of names) {
            if (!seen.has(n)) {
                seen.add(n);
                if (onlineStatus[n] === undefined) {
                    toCheck.push(n);
                }
            }
        }

        if (toCheck.length === 0) return;

        // Giới hạn số lượng mỗi lượt để nhẹ nhàng
        const MAX_BATCH = 10;
        const batch = toCheck.slice(0, MAX_BATCH);

        // Gửi lần lượt với delay nhỏ để tránh nghẽn
        batch.forEach((username, index) => {
            setTimeout(() => {
                try {
                    console.log(`[useChatPresence] [Group] calling checkOnline for member: ${username}`);
                    socketActions.checkOnline(username);
                } catch (e) {
                    console.warn('checkOnline failed for', username, e);
                }
            }, index * 200);
        });
    }, [isReady, activeChat, memberList, myUsername, socketActions, onlineStatus]);
};
