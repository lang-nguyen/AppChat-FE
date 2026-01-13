import { useMemo, useCallback, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useApi } from '../../../app/providers/useApi';
import { createSettingsRepository } from '../api/settingsRepository';
import { THEMES, THEME_COMBOS } from '../constants/themeConstants';

/**
 * Hook quản lý và áp dụng Theme cho cuộc trò chuyện
 * Layer: Application
 */
export const useChatTheme = () => {
    const { actions: apiActions } = useApi();
    const activeChat = useSelector((state) => state.chat.activeChat);
    const user = useSelector((state) => state.auth.user);
    const myUsername = user?.user || user?.username || localStorage.getItem('user_name');

    const repository = useMemo(() => createSettingsRepository(apiActions), [apiActions]);

    /**
     * Áp dụng bộ màu vào CSS Variables của DOM
     */
    const applyTheme = useCallback((combo) => {
        if (!combo) return;

        const root = document.documentElement;
        root.style.setProperty('--theme-primary', combo.primary);
        root.style.setProperty('--theme-header-bg', combo.headerBg);
        root.style.setProperty('--theme-sender-bubble', combo.senderBubble);
        root.style.setProperty('--theme-text-on-primary', combo.textOnPrimary);
        root.style.setProperty('--theme-card-bg', combo.cardBg);
        root.style.setProperty('--theme-border', combo.border);
        root.style.setProperty('--theme-gradient', combo.gradient);
    }, []);

    /**
     * Tải theme từ server khi đổi cuộc trò chuyện
     */
    useEffect(() => {
        if (!activeChat || activeChat.type === 1 || activeChat.type === 'room' || activeChat.type === 'group') {
            // Đối với group hiện tại có thể dùng mặc định hoặc mở rộng sau
            applyTheme(THEME_COMBOS[THEMES.DEFAULT]);
            return;
        }

        const loadTheme = async () => {
            const combo = await repository.getChatTheme(myUsername, activeChat.name);
            applyTheme(combo);
        };

        loadTheme();
    }, [activeChat, myUsername, repository, applyTheme]);

    /**
     * Cập nhật theme mới
     */
    const changeTheme = useCallback(async (themeId) => {
        if (!activeChat || !myUsername) return;

        // Optimistic UI: Áp dụng ngay lập tức cho trải nghiệm mượt mà
        applyTheme(THEME_COMBOS[themeId]);

        // Lưu vào server
        await repository.updateChatTheme(myUsername, activeChat.name, themeId);
    }, [activeChat, myUsername, repository, applyTheme]);

    return {
        changeTheme,
        themes: THEME_COMBOS
    };
};
