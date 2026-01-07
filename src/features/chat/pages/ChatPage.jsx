import { useState, useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import styles from "./ChatPage.module.css";
import UserHeader from "../components/sidebar/UserHeader.jsx";
import SearchBox from "../components/sidebar/SearchBox.jsx";
import RoomList from "../components/sidebar/RoomList.jsx";
import ChatRoomCard from "../components/chatbox/ChatRoomCard.jsx";
import ChatPlaceholder from "../components/chatbox/ChatPlaceholder.jsx";
import ChatInfo from "../components/chatbox/ChatInfo.jsx";
import { useChatSidebar } from "../hooks/useChatSidebar.js";
import { useChatMessage } from "../hooks/useChatMessage.js";
import { useSocket } from '../../../app/providers/useSocket';
import CreateRoomModal from "../components/sidebar/CreateRoomModal.jsx";
import SearchResult from "../components/sidebar/SearchResult.jsx";
import ContactRequestModal from "../components/sidebar/ContactRequestModal.jsx";
import ContactRequestsModal from "../components/sidebar/ContactRequestsModal.jsx";
import PageHeader from "../components/PageHeader.jsx"; // Import PageHeader

const ChatPage = () => {
    const navigate = useNavigate();
    const { title, rooms, selectRoom } = useChatSidebar();
    const { actions: socketActions, socketRef } = useSocket(); // Added socketRef
    const user = useSelector((s) => s.auth.user);

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
        handleAddMember
    } = useChatMessage();

    // States cho phần liên hệ
    const [showCreateRoom, setShowCreateRoom] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [showContactRequest, setShowContactRequest] = useState(false);
    const [contactRecipient, setContactRecipient] = useState('');
    const [showContactRequests, setShowContactRequests] = useState(false);
    const [contactError, setContactError] = useState('');

    // Tự điều hướng sang login page nếu không có user và code
    useEffect(() => {
        const hasCode = localStorage.getItem('re_login_code');
        if (!user && !hasCode) {
            navigate("/login", { replace: true });
        }
    }, [user, navigate]);

    // Reset info panel when changing chat
    useEffect(() => {
        setShowInfo(false);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeChat]);

    // Override handleCreateRoom để dùng modal thay vì prompt
    const handleCreateRoom = () => {
        setShowCreateRoom(true);
    };

    // Filter rooms theo search query
    const filteredRooms = useMemo(() => {
        if (!searchQuery.trim()) return rooms;
        const query = searchQuery.toLowerCase();
        return rooms.filter(room =>
            room.name.toLowerCase().includes(query)
        );
    }, [rooms, searchQuery]);

    // Kiểm tra xem có nên hiển thị SearchResult không
    const shouldShowSearchResult = useMemo(() => {
        return searchQuery.trim().length > 0 && filteredRooms.length === 0;
    }, [searchQuery, filteredRooms]);

    // Handler khi bấm "Liên hệ" - Check user exist trước
    const handleContact = (username) => {
        // Clear callback cũ và error cũ nếu có (tránh xung đột khi click nhiều lần)
        if (window.__pendingContactCheck) {
            window.__pendingContactCheck = null;
        }
        setContactError('');

        // Lưu username để xử lý khi nhận response
        setContactRecipient(username);

        // Lưu callback vào window để socketHandlers có thể gọi
        window.__pendingContactCheck = {
            username: username,
            onSuccess: () => {
                setShowContactRequest(true);
                setContactError('');
                window.__pendingContactCheck = null;
            },
            onError: () => {
                setContactError('Người dùng không tồn tại');
                window.__pendingContactCheck = null;
            }
        };

        // Kiểm tra user có tồn tại không trước khi mở modal
        socketActions.checkExist(username);
    };

    // Handler khi gửi yêu cầu liên hệ - Gửi tin nhắn riêng
    const handleSendContactRequest = (recipientName, message) => {
        // Gửi tin nhắn riêng tới người đó với type="people"
        socketActions.sendChat(recipientName, message, "people");
        console.log('Đã gửi yêu cầu liên hệ đến:', recipientName);
        // Đóng modal ngay sau khi gửi (không đợi response)
        setShowContactRequest(false);
        // Clear search query để hiển thị danh sách đầy đủ
        setSearchQuery('');

        // Gọi getUserList ngay sau khi gửi với delay để đảm bảo server đã xử lý
        setTimeout(() => {
            console.log('Tự động refresh danh sách user sau khi gửi contact request');
            socketActions.getUserList();
        }, 500);
        // Gọi thêm lần nữa sau 1.5s để đảm bảo
        setTimeout(() => {
            socketActions.getUserList();
        }, 1500);
    };

    // Handler mở modal yêu cầu liên hệ
    const handleOpenContactRequests = () => {
        setShowContactRequests(true);
    };

    // Handler khi click vào user trong danh sách yêu cầu liên hệ
    const handleSelectContactRequest = (username) => {
        // Select room và load tin nhắn (logic này đã có trong hook)
        selectRoom({ name: username, type: 0 });
        setShowContactRequests(false);
    };

    const handleLogout = () => {
        if (window.confirm("Bạn có chắc chắn muốn đăng xuất?")) {
            socketActions.logout(socketRef);
        }
    };

    return (
        <div className={styles.page}>
            <PageHeader onLogout={handleLogout} />
            <div className={styles["chat-container"]}>
                <div className={styles["chat-sidebar"]}>
                    {/* Sidebar Header có nút tạo phòng và yêu cầu liên hệ */}
                    <UserHeader
                        name={title}
                        onAdd={handleCreateRoom}
                        onContactRequests={handleOpenContactRequests}
                    />
                    <SearchBox
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {/* Hiển thị SearchResult nếu không tìm thấy room nào, ngược lại hiển thị RoomList với nút Liên hệ ở cuối nếu có search query */}
                    {shouldShowSearchResult ? (
                        <SearchResult
                            searchQuery={searchQuery}
                            onContact={handleContact}
                            contactError={contactError}
                        />
                    ) : (
                        <RoomList
                            rooms={filteredRooms}
                            onSelect={selectRoom}
                            searchQuery={searchQuery}
                            onContact={handleContact}
                            contactError={contactError}
                        />
                    )}
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
            {/* Create Room Modal */}
            {showCreateRoom && (
                <>
                    <div className={styles["create-room-modal-backdrop"]} onClick={() => setShowCreateRoom(false)} />
                    <div className={styles["create-room-modal-container"]}>
                        <CreateRoomModal onClose={() => setShowCreateRoom(false)} />
                    </div>
                </>
            )}
            {/* Contact Request Modal - Gửi tin nhắn liên hệ */}
            {showContactRequest && (
                <>
                    <div className={styles["contact-request-modal-backdrop"]} onClick={() => setShowContactRequest(false)} />
                    <div className={styles["contact-request-modal-container"]}>
                        <ContactRequestModal
                            recipientName={contactRecipient}
                            onClose={() => setShowContactRequest(false)}
                            onSend={handleSendContactRequest}
                        />
                    </div>
                </>
            )}
            {/* Contact Requests Modal - Danh sách yêu cầu liên hệ */}
            {showContactRequests && (
                <>
                    <div className={styles["create-room-modal-backdrop"]} onClick={() => setShowContactRequests(false)} />
                    <div className={styles["create-room-modal-container"]}>
                        <ContactRequestsModal
                            onClose={() => setShowContactRequests(false)}
                            onSelectUser={handleSelectContactRequest}
                        />
                    </div>
                </>
            )}
        </div>
    );
};

export default ChatPage;