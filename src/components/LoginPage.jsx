import React, { useState, useEffect } from 'react';
import { useSocket } from '../context/SocketContext';
import { Link, useNavigate } from 'react-router-dom';

// Test socket
const LoginPage = () => {
    // 1. Lấy "đồ nghề" từ Context mới (đã clean)
    const { actions, user, error, setError, isReady } = useSocket();

    // Hook điều hướng trang
    const navigate = useNavigate();

    // State cho form nhập liệu
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    // 2. Logic Tự động chuyển hướng
    // Mỗi khi biến 'user' thay đổi (do file socketHandlers cập nhật), hàm này sẽ chạy
    useEffect(() => {
        if (user) {
            console.log("Đăng nhập thành công, đang chuyển trang...");
            navigate("/chat"); // Chuyển sang trang Chat
        }
    }, [user, navigate]);

    // 3. Xử lý khi bấm nút Đăng Nhập
    const handleLogin = (e) => {
        e.preventDefault();

        if (!isReady) {
            alert("Mất kết nối server! Vui lòng tải lại trang.");
            return;
        }

        actions.login(username, password);
    };

    const handleTyping = (setter, value) => {
        setter(value);
        if (error) setError("");
    };

    return (
        <div style={{ maxWidth: 400, margin: '50px auto', padding: 30, border: '1px solid #ddd', borderRadius: 10, boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
            <h2 style={{ textAlign: 'center', color: '#333' }}>Đăng Nhập Chat</h2>

            {/* Đèn báo trạng thái Socket */}
            <div style={{ textAlign: 'center', marginBottom: 20, fontSize: 14 }}>
                Server:
                <span style={{ color: isReady ? 'green' : 'red', fontWeight: 'bold', marginLeft: 5 }}>
                    {isReady ? "● Online" : "● Offline"}
                </span>
            </div>

            {/* Thông báo lỗi nếu có */}
            {error && (
                <div style={{ background: '#ffebee', color: '#c62828', padding: 10, borderRadius: 5, marginBottom: 15, fontSize: 14 }}>
                    ⚠️ {error}
                </div>
            )}

            <form onSubmit={handleLogin}>
                <div style={{ marginBottom: 15 }}>
                    <label style={{ display: 'block', marginBottom: 5, fontWeight: 500 }}>Tài khoản:</label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => handleTyping(setUsername, e.target.value)}
                        required
                        placeholder="Nhập username..."
                        style={{ width: '100%', padding: 10, borderRadius: 5, border: '1px solid #ccc', boxSizing: 'border-box' }}
                    />
                </div>

                <div style={{ marginBottom: 20 }}>
                    <label style={{ display: 'block', marginBottom: 5, fontWeight: 500 }}>Mật khẩu:</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => handleTyping(setPassword, e.target.value)}
                        required
                        placeholder="Nhập mật khẩu..."
                        style={{ width: '100%', padding: 10, borderRadius: 5, border: '1px solid #ccc', boxSizing: 'border-box' }}
                    />
                </div>

                <button
                    type="submit"
                    disabled={!isReady}
                    style={{
                        width: '100%',
                        padding: 12,
                        background: isReady ? '#007bff' : '#ccc',
                        color: 'white',
                        border: 'none',
                        borderRadius: 5,
                        fontSize: 16,
                        fontWeight: 'bold',
                        cursor: isReady ? 'pointer' : 'not-allowed',
                        transition: '0.3s'
                    }}
                >
                    {isReady ? "Đăng Nhập" : "Đang kết nối..."}
                </button>
            </form>

            <p style={{ marginTop: 20, textAlign: 'center', fontSize: 14 }}>
                Chưa có tài khoản? <Link to="/register" style={{ color: '#007bff', textDecoration: 'none' }}>Đăng ký ngay</Link>
            </p>
        </div>
    );
};

export default LoginPage;