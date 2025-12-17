import React, { useState } from 'react';
import { useSocket } from '../context/SocketContext';

// Test socket
const ChatPage = () => {
    const {  actions: { sendChat }, messages, isReady } = useSocket();

    // State cho ô nhập liệu
    const [text, setText] = useState("");
    const [receiverId, setReceiverId] = useState("ti"); // ID người nhận hoặc ID nhóm
    const [chatType, setChatType] = useState("people"); // Loại chat: 'people' hoặc 'group'

    const sendMessage = () => {
        if(!text) return;

        // Gọi hàm gửi xuống server
        sendChat("SEND_CHAT", {
            type: chatType,
            to: receiverId,
            mes: text
        });

        setText("");
    };

    return (
        <div style={{ padding: 20 }}>
            <h2>Test Chat Group & People</h2>

            {/* 1. Trạng thái kết nối */}
            <p>Trạng thái:
                <b style={{ color: isReady ? 'green' : 'red' }}>
                    {isReady ? " ĐÃ KẾT NỐI" : " ..."}
                </b>
            </p>

            {/* 2. Cấu hình gửi (QUAN TRỌNG ĐỂ TEST) */}
            <div style={{ marginBottom: 10, border: '1px solid #ccc', padding: 10 }}>
                <label>Gửi đến (ID): </label>
                <input
                    value={receiverId}
                    onChange={(e) => setReceiverId(e.target.value)}
                    placeholder="Nhập ID User hoặc ID Group"
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

            {/* 4. Log tin nhắn về */}
            <h3>Log tin nhắn:</h3>
            <ul style={{ maxHeight: 300, overflowY: 'scroll', background: '#f0f0f0' }}>
                {messages.map((msg, index) => (
                    <li key={index} style={{ borderBottom: '1px solid #ddd', padding: 5 }}>
                        {/* Hiển thị rõ để debug */}
                        <b>{msg.sender || 'Server'}: </b> {msg.mes || JSON.stringify(msg)}
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default ChatPage;