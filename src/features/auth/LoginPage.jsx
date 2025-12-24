import React, { useState, useEffect } from 'react';
import { useSocket } from '../../app/providers/SocketProvider.jsx';
import { Link, useNavigate } from 'react-router-dom';
import styles from './LoginPage.module.css';

// Test socket
const LoginPage = () => {
    // 1. Lấy "đồ nghề" từ Context mới
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

        // Lưu trước username vào LocalStorage (để dành cho re-login)
        localStorage.setItem('user_name', username);

        actions.login(username, password);
    };

    const handleTyping = (setter, value) => {
        setter(value);
        if (error) setError("");
    };

    return (
        <div className={styles.page}>
            <div className={styles.container}>
                <h2 className={styles.title}>Đăng Nhập Chat</h2>

                {/* Đèn báo trạng thái Socket */}
                <div style={{ textAlign: 'center', marginBottom: 20, fontSize: 14 }}>
                    Server:
                    <span style={{ color: isReady ? 'green' : 'red', fontWeight: 'bold', marginLeft: 5 }}>
                        {isReady ? "Online" : "Offline"}
                    </span>
                </div>

                {/* Thông báo lỗi nếu có */}
                {error && (
                    <div style={{ background: '#ffebee', color: '#c62828', padding: 10, borderRadius: 5, marginBottom: 15, fontSize: 14 }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin}>
                    <div className={styles.field}>
                        <label className={styles.label}>Tài khoản:</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => handleTyping(setUsername, e.target.value)}
                            required
                            placeholder="Nhập username..."
                            className={styles.input}
                        />
                    </div>

                    <div className={styles.fieldLast}>
                        <label className={styles.label}>Mật khẩu:</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => handleTyping(setPassword, e.target.value)}
                            required
                            placeholder="Nhập mật khẩu..."
                            className={styles.input}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={!isReady}
                        className={[
                            styles.button,
                            isReady ? styles.buttonEnabled : styles.buttonDisabled
                        ].join(' ')}
                    >
                        {isReady ? "Đăng Nhập" : "Đang kết nối..."}
                    </button>
                </form>

                <p className={styles.footer}>
                    Chưa có tài khoản? <Link to="/register" className={styles.link}>Đăng ký ngay</Link>
                </p>
            </div>
        </div>
    );
};

export default LoginPage;