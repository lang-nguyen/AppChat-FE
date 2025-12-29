import styles from "./ChatPage.module.css";
import {useSocket} from "../../../app/providers/SocketProvider.jsx";
import {useEffect} from "react";
import {useDispatch, useSelector} from "react-redux";
import {setActiveChat} from "../../../state/chat/chatSlice.js";
import UserHeader from "../components/sidebar/UserHeader.jsx";
import SearchBox from "../components/sidebar/SearchBox.jsx";
import RoomList from "../components/sidebar/RoomList.jsx";
import ChatPlaceholder from "../components/chatbox/ChatPlaceholder.jsx";

const ChatPage = () => {
    const {actions, isReady} = useSocket();
    const dispatch = useDispatch();
    const people = useSelector((s) => s.chat.people);
    const activeChat = useSelector((s) => s.chat.activeChat);

    useEffect(() => {
        if (isReady) actions.getUserList();
    }, [isReady, actions]);

    const rooms = people.map((x) => ({
        key: `${x.type}:${x.name}`,
        name: x.name,
        type: x.type, // 0 people, 1 group
        badge: x.type === 1 ? "Group" : "People",
        lastMessage: x.actionTime ?? "",
        active: activeChat?.name === x.name && activeChat?.type === x.type,
    }));

    return (
        <div className={styles.page}>
            <div className={styles["chat-container"]}>
                <div className={styles["chat-sidebar"]}>
                    <UserHeader name="Tên người dùng" onAdd={() => { /* TODO: create group later */
                    }}/>
                    <SearchBox/>
                    <RoomList
                        rooms={rooms}
                        onSelect={(r) => dispatch(setActiveChat({name: r.name, type: r.type}))}
                    />
                </div>
                <div className={styles["chat-main"]}>
                    <ChatPlaceholder />
                </div>
            </div>
        </div>
    );
};

export default ChatPage;