import { useCallback, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSocket } from "../../../app/providers/useSocket.js";
import { setActiveChat } from "../../../state/chat/chatSlice.js";

export function useChatSidebar() {
  const { actions, isReady } = useSocket();
  const dispatch = useDispatch();

  const user = useSelector((s) => s.auth.user);
  const people = useSelector((s) => s.chat.people);
  const activeChat = useSelector((s) => s.chat.activeChat);
  const onlineStatus = useSelector((s) => s.chat.onlineStatus);

  // Auto-fetch list sau khi socket ready + đã login/relogin
  useEffect(() => {
    const hasUser = user && (user.user || user.name || user.username);
    if (isReady && hasUser) actions.getUserList();
  }, [isReady, user, actions]);

  const title = useMemo(() => {
    const fromRedux = user?.name || user?.user || user?.username;
    return fromRedux || localStorage.getItem("user_name") || "Tên người dùng";
  }, [user]);

  // Format thời gian hiển thị: "12:00", "Hôm qua", "01/01/2024"
  const formatLastMessageTime = (timeStr) => {
    if (!timeStr) return "";
    
    try {
      const date = new Date(timeStr);
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const messageDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      const diffDays = Math.floor((today - messageDate) / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) {
        // Hôm nay: hiển thị giờ
        return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
      } else if (diffDays === 1) {
        // Hôm qua
        return "Hôm qua";
      } else if (diffDays < 7) {
        // Trong tuần: hiển thị thứ
        return date.toLocaleDateString('vi-VN', { weekday: 'short' });
      } else {
        // Quá 1 tuần: hiển thị ngày/tháng/năm
        return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
      }
    } catch (e) {
      return "";
    }
  };

  const rooms = useMemo(() => {
    return (people ?? []).map((x) => {
      const messageText = x.lastMessage || '';
      const timeText = formatLastMessageTime(x.actionTime);
      // Kết hợp nội dung tin nhắn và thời gian: "Nội dung tin nhắn • 12:00"
      const lastMessageDisplay = messageText && timeText 
        ? `${messageText} • ${timeText}`
        : messageText || timeText || '';
      
      return {
        key: `${x.type}:${x.name}`,
        name: x.name,
        type: x.type, // 0 people, 1 group
        badge: x.type === 1 ? "Group" : "People",
        lastMessage: lastMessageDisplay,
        active: activeChat?.name === x.name && activeChat?.type === x.type,
        isOnline: x.type === 1 ? undefined : onlineStatus[x.name], // Chỉ check online cho user
      };
    });
  }, [people, activeChat, onlineStatus]);

  const selectRoom = useCallback(
    (r) => {
      console.log("Selecting room:", r);
      dispatch(setActiveChat({ name: r.name, type: r.type }));
    },
    [dispatch]
  );

  const refreshList = useCallback(() => {
    if (isReady) actions.getUserList();
  }, [isReady, actions]);

  return { isReady, title, rooms, activeChat, selectRoom, refreshList };
}


