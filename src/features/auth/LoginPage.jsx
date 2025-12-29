import React, {useState, useEffect} from 'react';
import {useSocket} from '../../app/providers/SocketProvider.jsx';
import {Link, useNavigate} from 'react-router-dom';
import styles from './LoginPage.module.css';
import {useDispatch, useSelector} from "react-redux";
import {clearError} from "../../state/auth/authSlice.js";

// Test socket
const LoginPage = () => {
    // 1. Lấy "đồ nghề" từ Context mới
    const {actions, isReady} = useSocket();

    const dispatch = useDispatch();
    const user = useSelector((s) => s.auth.user);
    const error = useSelector((s) => s.auth.error);

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
        if (error) dispatch(clearError());
    };

    return (
        <div className={styles.page}>
            <div className={styles.container}>
                <h2 className={styles.title}>Đăng Nhập Chat</h2>

                {/* Đèn báo trạng thái Socket */}
                <div className={styles.serverStatus}>
                    Server: 
                    <span
                        className={[
                            styles.serverDot,
                            isReady ? styles.online : styles.offline
                        ].join(' ')}
                    >
                    {isReady ? "● Online" : "● Offline"}
                </span>
                </div>

                {/* Thông báo lỗi nếu có */}
                {error && (
                    <div className={styles.errorBox}>
                        ⚠️ {error}
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