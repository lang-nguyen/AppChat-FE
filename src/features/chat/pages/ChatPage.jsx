import { useState, useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import styles from "./ChatPage.module.css";
import UserHeader from "../components/sidebar/UserHeader.jsx";
import SearchBox from "../components/sidebar/SearchBox.jsx";
import RoomList from "../components/sidebar/RoomList.jsx";
import ChatRoomCard from "../components/chatbox/ChatRoomCard.jsx";
import ChatPlaceholder from "../components/chatbox/ChatPlaceholder.jsx";
import { useChatSidebar } from "../hooks/useChatSidebar.js";
import { useSocket } from '../../../app/providers/useSocket';
import ChatInfo from "../components/chatbox/ChatInfo.jsx";
import CreateRoomModal from "../components/sidebar/CreateRoomModal.jsx";
import SearchResult from "../components/sidebar/SearchResult.jsx";
import ContactRequestModal from "../components/sidebar/ContactRequestModal.jsx";
import ContactRequestsModal from "../components/sidebar/ContactRequestsModal.jsx";

const ChatPage = () => {
    const navigate = useNavigate(); //+1
    const { title, rooms, selectRoom, activeChat } = useChatSidebar();
    const { actions: socketActions } = useSocket();
    const [showInfo, setShowInfo] = useState(false);
    const [showCreateRoom, setShowCreateRoom] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [showContactRequest, setShowContactRequest] = useState(false);
    const [contactRecipient, setContactRecipient] = useState('');
    const [showContactRequests, setShowContactRequests] = useState(false);
    const [contactError, setContactError] = useState('');

    const user = useSelector((s) => s.auth.user);
    const people = useSelector((s) => s.chat.people);
    const onlineStatus = useSelector((s) => s.chat.onlineStatus);

    // Redirect về login nếu user = null (đã logout)
    useEffect(() => {
        if (!user) {
            navigate("/login", { replace: true });
        }
    }, [user, navigate]);

    // Tính toán danh sách thành viên thực tế
    const memberList = useMemo(() => {
        if (!activeChat) return [];

        if (activeChat.type === 0 || activeChat.type === 'people') {
            // Chat 1-1: Chỉ hiện mình và người đó
            return [
                { name: title, isOnline: true },
                { name: activeChat.name, isOnline: !!onlineStatus[activeChat.name] }
            ];
        } else {
            // Chat Nhóm: Lấy từ data phòng trong store
            const roomData = people.find(p => p.name === activeChat.name && p.type === activeChat.type);
            const userList = roomData?.userList || [];

            return userList.map(m => {
                const name = typeof m === 'string' ? m : m.name;
                return {
                    name: name,
                    isOnline: !!onlineStatus[name]
                };
            });
        }
    }, [activeChat, people, onlineStatus, title]);

    // Reset info panel when changing chat
    useEffect(() => {
        setShowInfo(false);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeChat]);

    const handleCreateRoom = () => {
        setShowCreateRoom(true); // Mở modal
    };



    //+1 Filter rooms theo search query
    const filteredRooms = useMemo(() => {
        if (!searchQuery.trim()) return rooms;
        const query = searchQuery.toLowerCase();
        return rooms.filter(room => 
            room.name.toLowerCase().includes(query)
        );
    }, [rooms, searchQuery]);

    //+1 Kiểm tra xem có nên hiển thị SearchResult không
    // Hiển thị SearchResult khi: có search query nhưng không tìm thấy room nào
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

        //thử nghiệm
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

    // Handler mở modal yêu cầu liên hệ
    const handleOpenContactRequests = () => {
        setShowContactRequests(true);
    };

    // Handler khi click vào user trong danh sách yêu cầu liên hệ
    const handleSelectContactRequest = (username) => {
        // Select room và load tin nhắn
        selectRoom({ name: username, type: 0 });
        setShowContactRequests(false);
    };

    return (
        <div className={styles.page}>
            <div className={styles["chat-container"]}>
                <div className={styles["chat-sidebar"]}>
                    <UserHeader name={title} onAdd={handleCreateRoom} onContactRequests={handleOpenContactRequests} />
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
                    {/* Debug log */}
                    {/* {console.log("Active Chat in Render:", activeChat)} */}
                    {activeChat ? (
                        <ChatRoomCard onInfoClick={() => setShowInfo(!showInfo)} />
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
            {/* Create Room Modal - overlay đè lên, nằm kế sidebar */}
            {showCreateRoom && (
                <>
                    <div className={styles["create-room-modal-backdrop"]} onClick={() => setShowCreateRoom(false)} />
                    <div className={styles["create-room-modal-container"]}>
                        <CreateRoomModal onClose={() => setShowCreateRoom(false)} />
                    </div>
                </>
            )}
            {/* Contact Request Modal - cùng kích thước với Create Room Modal */}
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