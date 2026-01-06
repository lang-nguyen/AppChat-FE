import styles from "./ChatPage.module.css";
import UserHeader from "../components/sidebar/UserHeader.jsx";
import SearchBox from "../components/sidebar/SearchBox.jsx";
import RoomList from "../components/sidebar/RoomList.jsx";
import ChatRoomCard from "../components/chatbox/ChatRoomCard.jsx";
import ChatPlaceholder from "../components/chatbox/ChatPlaceholder.jsx";
import ChatInfo from "../components/chatbox/ChatInfo.jsx";
import { useChatSidebar } from "../hooks/useChatSidebar.js";
import { useChatMessage } from "../hooks/useChatMessage.js";

const ChatPage = () => {
    const { title, rooms, selectRoom } = useChatSidebar();

    // Hook ChatMessage (Quản lý chi tiết chat: message, member, actions)
    const {
        activeChat,
        messages,
        myUsername,
        isOnline,
        memberList,
        showInfo,
        setShowInfo,
        inputText,
        setInputText,
        page,
        isLoading,
        messagesEndRef,
        chatContainerRef,
        handleScroll,
        handleSend,
        handleAddMember,
        handleCreateRoom
    } = useChatMessage();

    return (
        <div className={styles.page}>
            <div className={styles["chat-container"]}>
                <div className={styles["chat-sidebar"]}>
                    {/* Sidebar Header có nút tạo phòng */}
                    <UserHeader name={title} onAdd={handleCreateRoom} />
                    <SearchBox />
                    <RoomList
                        rooms={rooms}
                        onSelect={selectRoom}
                    />
                </div>
                <div className={styles["chat-main"]}>
                    {activeChat ? (
                        <ChatRoomCard
                            activeChat={activeChat}
                            messages={messages}
                            myUsername={myUsername}
                            isOnline={isOnline}
                            inputText={inputText}
                            setInputText={setInputText}
                            page={page}
                            isLoading={isLoading}
                            handleSend={handleSend}
                            handleScroll={handleScroll}
                            messagesEndRef={messagesEndRef}
                            chatContainerRef={chatContainerRef}
                            onInfoClick={() => setShowInfo(!showInfo)}
                        />
                    ) : (
                        <ChatPlaceholder />
                    )}
                </div>
                {/* Sidebar thông tin chat (ChatInfo) */}
                {activeChat && showInfo && (
                    <div className={styles["chat-info-sidebar"]}>
                        <ChatInfo
                            isGroup={activeChat.type === 1 || activeChat.type === 'group' || activeChat.type === 'room'}
                            members={memberList}
                            onAddMember={handleAddMember}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChatPage;