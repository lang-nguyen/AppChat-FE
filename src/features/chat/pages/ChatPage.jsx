import styles from "./ChatPage.module.css";
import UserHeader from "../components/sidebar/UserHeader.jsx";
import SearchBox from "../components/sidebar/SearchBox.jsx";
import RoomList from "../components/sidebar/RoomList.jsx";
import ChatRoomCard from "../components/chatbox/ChatRoomCard.jsx";
import ChatPlaceholder from "../components/chatbox/ChatPlaceholder.jsx";
import { useChatSidebar } from "../hooks/useChatSidebar.js";
import { useSocket } from "../../../app/providers/SocketProvider.jsx";
import ChatInfo from "../components/chatbox/ChatInfo.jsx";

const ChatPage = () => {
    const { title, rooms, selectRoom, activeChat } = useChatSidebar();
    const { actions: socketActions } = useSocket();

    const handleCreateRoom = () => {
        const roomName = window.prompt("Nhập tên phòng chat mới:");
        if (roomName) {
            socketActions.createRoom(roomName);
        }
    };

    const handleAddMember = () => {
        // Prompt người dùng nhập tên thành viên muốn thêm
        const username = window.prompt("Nhập tên người dùng muốn thêm vào nhóm:");
        if (username) {
            // Kiểm tra xem user có tồn tại không
            socketActions.checkExist(username);

            // Tạm thời log và thông báo giả lập cho kiểm thử
            console.log(`Đang thực hiện thêm thành viên: ${username} vào phòng: ${activeChat?.name}`);
            window.alert(`Đã gửi yêu cầu thêm thành viên ${username}`);
        }
    };

    return (
        <div className={styles.page}>
            <div className={styles["chat-container"]}>
                <div className={styles["chat-sidebar"]}>
                    <UserHeader name={title} onAdd={handleCreateRoom} />
                    <SearchBox />
                    <RoomList
                        rooms={rooms}
                        onSelect={selectRoom}
                    />
                </div>
                <div className={styles["chat-main"]}>
                    {activeChat ? <ChatRoomCard /> : <ChatPlaceholder />}
                </div>
                {/* Sidebar thông tin chat (ChatInfo) */}
                {activeChat && (
                    <div className={styles["chat-info-sidebar"]}>
                        <ChatInfo
                            isGroup={activeChat.type === 1 || activeChat.type === 'group' || activeChat.type === 'room'}
                            members={[]}
                            onAddMember={handleAddMember}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChatPage;