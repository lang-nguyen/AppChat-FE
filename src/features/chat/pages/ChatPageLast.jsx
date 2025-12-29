import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../../../app/providers/SocketProvider.jsx';

const ChatPage = () => {
    const { actions, messages, isReady, user } = useSocket();
    const [text, setText] = useState("");
    const [receiverId, setReceiverId] = useState("ti");
    const [chatType, setChatType] = useState("people");

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
                <input
                    value={receiverId}
                    onChange={(e) => setReceiverId(e.target.value)}
                    placeholder="Nhập username..."
                />
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