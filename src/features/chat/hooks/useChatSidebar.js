import { useCallback, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSocket } from "../../../app/providers/SocketProvider.jsx";
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
    if (isReady && user) actions.getUserList();
  }, [isReady, user, actions]);

  const title = useMemo(() => {
    const fromRedux = user?.user || user?.name || user?.username;
    return fromRedux || localStorage.getItem("user_name") || "Tên người dùng";
  }, [user]);

  const rooms = useMemo(() => {
    return (people ?? []).map((x) => ({
      key: `${x.type}:${x.name}`,
      name: x.name,
      type: x.type, // 0 people, 1 group
      badge: x.type === 1 ? "Group" : "People",
      lastMessage: x.actionTime ?? "",
      active: activeChat?.name === x.name && activeChat?.type === x.type,
      isOnline: x.type === 1 ? undefined : onlineStatus[x.name], // Chỉ check online cho user
    }));
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


