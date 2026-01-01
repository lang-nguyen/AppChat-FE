import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useSocket } from '../../../app/providers/SocketProvider.jsx';
import { setCheckUserResult } from "../../../state/chat/chatSlice";

const ChatPage = () => {
    // 1. Chỉ lấy connection & actions từ SocketContext
    const { actions, isReady } = useSocket();

    // 2. Lấy Data từ Redux
    const dispatch = useDispatch();
    const user = useSelector(state => state.auth.user);
    const messages = useSelector(state => state.chat.messages);
    const checkUserResult = useSelector(state => state.chat.checkUserResult);

    const [text, setText] = useState("");
    const [receiverId, setReceiverId] = useState("");
    const [chatType, setChatType] = useState("people");
    const [userExists, setUserExists] = useState(null); // null: chưa check, true: tồn tại, false: không tồn tại

    // Effect xử lý kết quả check từ server
    useEffect(() => {
        if (checkUserResult) {
            console.log("Check result in ChatPage:", checkUserResult);

            // Server trả về status: true (tồn tại) hoặc false (không tồn tại)
            if (checkUserResult.status === true) {
                setUserExists(true);
            } else {
                setUserExists(false);
            }
        }
    }, [checkUserResult]);

    const handleCheckUser = () => {
        if (receiverId && chatType === 'people') {
            setUserExists(null); // Reset icon đang loading/chờ
            // Nếu có kết quả cũ trong store thì clear đi
            dispatch(setCheckUserResult(null));

            actions.checkUserExist(receiverId);
        }
    };

    const handleTypingReceiver = (e) => {
        setReceiverId(e.target.value);
        setUserExists(null); // Reset trạng thái khi gõ lại
        dispatch(setCheckUserResult(null));
    }

    const sendMessage = () => {
        if (!text) return;
        actions.sendChat(receiverId, text, chatType);
        setText("");
    };

    // 5. Hàm Logout
    const handleLogout = () => {
        if (actions.logout) {
            actions.logout();
        }
    };

    // 6. Redirect nếu chưa login
    const navigate = useNavigate();
    useEffect(() => {
        // Kiểm tra xem có user hay không (cần check cả code để biết user thật sự logout (vì F5 cũng làm mất user trong RAM))
        if (!user && !localStorage.getItem('re_login_code')) {
            navigate("/login");
        }
    }, [user, navigate]);


    return (
        <div style={{ padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2>Test Chat Group & People</h2>
                <button onClick={handleLogout} style={{ padding: '5px 10px', background: 'red', color: 'white', border: 'none', cursor: 'pointer' }}>
                    Logout
                </button>
            </div>

            {/* 1. Trạng thái kết nối */}
            <p>Trạng thái:
                <b style={{ color: isReady ? 'green' : 'red' }}>
                    {isReady ? " ĐÃ KẾT NỐI" : " ..."}
                </b>
            </p>

            {/* 2. Cấu hình gửi */}
            <div style={{ marginBottom: 10, border: '1px solid #ccc', padding: 10 }}>
                <label>Gửi đến (ID): </label>
                <div style={{ display: 'inline-flex', alignItems: 'center' }}>
                    <input
                        value={receiverId}
                        onChange={handleTypingReceiver}
                        onBlur={handleCheckUser}
                        placeholder="Nhập username..."
                    />
                    {/* Icon trạng thái user */}
                    {userExists === true && <span style={{ color: 'green', marginLeft: 5 }}>✅</span>}
                    {userExists === false && <span style={{ color: 'red', marginLeft: 5 }}>❌</span>}
                </div>

                <br /><br />
                <label>Loại chat: </label>
                <select value={chatType} onChange={(e) => setChatType(e.target.value)}>
                    <option value="people">Chat 1-1 (People)</option>
                    <option value="group">Chat Nhóm (Group)</option>
                </select>
            </div>

            {/* 3. Form nhập tin nhắn */}
            <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Nhập nội dung..."
                style={{ width: '300px' }}
            />
            <button onClick={sendMessage}>Gửi Chat</button>

            {/* 4. Log tin nhắn */}
            <h3>Log tin nhắn:</h3>
            <ul style={{ maxHeight: 300, overflowY: 'scroll', background: '#f0f0f0' }}>
                {messages.map((msg, index) => (
                    <li key={index} style={{ borderBottom: '1px solid #ddd', padding: 5 }}>
                        <b>{msg.sender || 'Server'}: </b> {typeof msg === 'string' ? msg : (msg.mes || JSON.stringify(msg))}
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default ChatPage;