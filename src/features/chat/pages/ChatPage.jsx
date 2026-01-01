import styles from "./ChatPage.module.css";
import UserHeader from "../components/sidebar/UserHeader.jsx";
import SearchBox from "../components/sidebar/SearchBox.jsx";
import RoomList from "../components/sidebar/RoomList.jsx";
import ChatPlaceholder from "../components/chatbox/ChatPlaceholder.jsx";
import {useChatSidebar} from "../hooks/useChatSidebar.js";

const ChatPage = () => {
    const {title, rooms, selectRoom} = useChatSidebar();

    return (
        <div className={styles.page}>
            <div className={styles["chat-container"]}>
                <div className={styles["chat-sidebar"]}>
                    <UserHeader name={title} onAdd={() => { /* TODO: create group later */ }}/>
                    <SearchBox/>
                    <RoomList
                        rooms={rooms}
                        onSelect={selectRoom} 
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