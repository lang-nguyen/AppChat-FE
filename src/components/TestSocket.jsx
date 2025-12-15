// src/components/TestSocket.jsx
import React, { useState } from 'react';
import { useChatSocket } from '../hooks/useChatSocket'; // Import hook vừa sửa

const TestSocket = () => {
    const { isReady, messages, sendData } = useChatSocket();
    const [inputMsg, setInputMsg] = useState("");

    // Hàm test Login
    const handleLogin = () => {
        // Thay user/pass này bằng cái bạn muốn test
        sendData("LOGIN", { user: "long", pass: "12345" });
    };

    // Hàm test Gửi tin nhắn
    const handleSend = () => {
        // Test gửi cho chính mình hoặc một user ảo nào đó
        sendData("SEND_CHAT", { type: "people", to: "ti", mes: inputMsg });
        setInputMsg("");
    };

    return (
        <div style={{ padding: 20 }}>
            <h2>Test Socket Connection</h2>

            {/* 1. Đèn báo trạng thái */}
            <div style={{ marginBottom: 10 }}>
                Trạng thái:
                <span style={{ color: isReady ? 'green' : 'red', fontWeight: 'bold' }}>
                    {isReady ? " ĐÃ KẾT NỐI" : " MẤT KẾT NỐI"}
                </span>
            </div>

            {/* 2. Nút chức năng */}
            <button onClick={handleLogin}>1. Bấm để Login</button>
            <br /><br />

            <input
                value={inputMsg}
                onChange={(e) => setInputMsg(e.target.value)}
                placeholder="Nhập tin nhắn..."
            />
            <button onClick={handleSend}>2. Gửi tin nhắn</button>

            {/* 3. Khu vực hiện kết quả trả về */}
            <h3>Log tin nhắn từ Server:</h3>
            <div style={{ background: '#f0f0f0', height: 300, overflowY: 'scroll', padding: 10 }}>
                {messages.map((msg, index) => (
                    <div key={index} style={{ borderBottom: '1px solid #ccc', marginBottom: 5 }}>
                        <pre>{JSON.stringify(msg, null, 2)}</pre>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TestSocket;