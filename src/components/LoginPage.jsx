// src/components/LoginPage.jsx
import React, { useState } from 'react';
import { useSocket } from '../context/SocketContext';
import {Link} from 'react-router-dom';

const LoginPage = () => {
    const { isReady } = useSocket(); // Lấy trạng thái socket xem có online không

    return (
        <div style={{ padding: 20, border: '2px solid blue' }}>
            <h1>🏠 Trang Login</h1>
            <p>Trạng thái Socket:
                <b style={{ color: isReady ? 'green' : 'red' }}>
                    {isReady ? " ĐÃ KẾT NỐI (Sẵn sàng)" : " Đang kết nối..."}
                </b>
            </p>
            <p>Hãy bấm vào link dưới để sang Chat, nhớ nhìn Console xem nó có kết nối lại không nhé!</p>

            {/* Link chuyển trang */}
            <Link to="/chat">
                <button style={{ fontSize: 20, cursor: 'pointer' }}>➡️ Vào Chat Ngay</button>
            </Link>
        </div>
    );
};

export default LoginPage;