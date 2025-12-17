// src/components/ChatPage.jsx
import React, { useState } from 'react';
import { useSocket } from '../context/SocketContext';

const ChatPage = () => {
    // Lấy socket singleton từ kho chung
    const { sendData, messages, isReady } = useSocket();
    const [text, setText] = useState("");

    const guiTinNhan = () => {
        // Gửi thử 1 tin nhắn vào Room hoặc cho People tùy bạn test
        sendData("SEND_CHAT", { type: "people", to: "ti", mes: text });
        setText("");
    };

    return (
        <div style={{ padding: 20 }}>
            <h2>Test Singleton Socket</h2>

            {/* 1. Kiểm tra trạng thái kết nối */}
            <p>Trạng thái:
                <b style={{ color: isReady ? 'green' : 'red' }}>
                    {isReady ? " ĐÃ KẾT NỐI (Singleton)" : " Đang kết nối..."}
                </b>
            </p>

            {/* 2. Form gửi tin */}
            <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Nhập tin nhắn..."
            />
            <button onClick={guiTinNhan}>Gửi Chat</button>

            {/* 3. Hiển thị tin nhắn nhận được */}
            <h3>Tin nhắn nhận được:</h3>
            <ul>
                {messages.map((msg, index) => (
                    <li key={index}>
                        {JSON.stringify(msg)}
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default ChatPage;