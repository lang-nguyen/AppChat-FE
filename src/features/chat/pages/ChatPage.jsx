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
import SearchResult from "../components/sidebar/SearchResult.jsx";
import { usePendingActions } from "../hooks/usePendingActions";
import { useChatTheme } from "../hooks/useChatTheme";
import PageHeader from "../components/headerChat/PageHeader.jsx"; // Import PageHeader
import ChatModals from "../components/ChatModals.jsx";

const ChatPage = () => {
    const navigate = useNavigate();
    const {
        title,
        rooms,
        selectRoom,
        searchQuery,
        setSearchQuery,
        activeTab: activeSidebarTab,
        setActiveTab: setActiveSidebarTab
    } = useChatSidebar();
    const { actions: socketActions, isReady } = useSocket();
    const {
        sendContactRequest,
        handleCheckUserExist,
        showContactRequest,
        setShowContactRequest,
        contactRecipient,
        contactError,
        setContactError
    } = usePendingActions();
    const { changeTheme } = useChatTheme(); // Get changeTheme action
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
        // File props
        selectedFile,
        isUploading,
        handleSelectFile,
        handleRemoveFile
    } = useChatMessage();

    // States cho phần liên hệ
    const [showCreateRoom, setShowCreateRoom] = useState(false);
    const [showContactRequests, setShowContactRequests] = useState(false);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const [showAddMember, setShowAddMember] = useState(false);

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

    // Kiểm tra xem có nên hiển thị SearchResult không
    const shouldShowSearchResult = useMemo(() => {
        return searchQuery.trim().length > 0 && rooms.length === 0;
    }, [searchQuery, rooms]);

    // Handler khi bấm "Liên hệ" - Pass through to hook
    const handleContact = (username) => {
        handleCheckUserExist(username);
    };

    const handleSendContactRequest = async (recipientName, message) => {
        try {
            await sendContactRequest(recipientName, message);
            setSearchQuery('');
        } catch {
            // Error handling is now inside the hook's state
        }
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

    const handleLogoutClick = () => {
        setShowLogoutConfirm(true);
    };

    const handleConfirmLogout = () => {
        socketActions.logout();
        setShowLogoutConfirm(false);
    };

    const handleAddMemberClick = () => {
        setShowAddMember(true);
    };

    return (
        <div className={styles.page}>
            <PageHeader onLogout={handleLogoutClick} />
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

                    {/* Sidebar Tabs */}
                    <div className={styles.tabsContainer}>
                        <button
                            className={`${styles.tab} ${activeSidebarTab === 'all' ? styles.activeTab : ''}`}
                            onClick={() => setActiveSidebarTab('all')}
                        >
                            Tất cả
                        </button>
                        <button
                            className={`${styles.tab} ${activeSidebarTab === 'group' ? styles.activeTab : ''}`}
                            onClick={() => setActiveSidebarTab('group')}
                        >
                            Nhóm
                        </button>
                        <div
                            className={styles.tabIndicator}
                            style={{
                                width: 'calc(50% - 1rem)',
                                left: activeSidebarTab === 'all' ? '1rem' : '50%'
                            }}
                        />
                    </div>
                    {/* Hiển thị SearchResult nếu không tìm thấy room nào, ngược lại hiển thị RoomList với nút Liên hệ ở cuối nếu có search query */}
                    {shouldShowSearchResult ? (
                        <SearchResult
                            searchQuery={searchQuery}
                            onContact={handleContact}
                            contactError={contactError}
                        />
                    ) : (
                        <RoomList
                            rooms={rooms}
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
                            // File props
                            selectedFile={selectedFile}
                            isUploading={isUploading}
                            handleSelectFile={handleSelectFile}
                            handleRemoveFile={handleRemoveFile}
                            isSocketReady={isReady}
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
                            onAddMember={handleAddMemberClick}
                            onChangeTheme={changeTheme}
                        />
                    </div>
                )}
            </div>
            <ChatModals
                modals={{
                    showCreateRoom,
                    showContactRequest,
                    showContactRequests,
                    showLogoutConfirm,
                    showAddMember,
                    activeChat,
                    contactRecipient,
                    memberList
                }}
                handlers={{
                    setShowCreateRoom,
                    setShowContactRequest,
                    setShowContactRequests,
                    setShowLogoutConfirm,
                    setShowAddMember,
                    handleSendContactRequest,
                    handleSelectContactRequest,
                    handleConfirmLogout
                }}
            />
        </div>
    );
};

export default ChatPage;