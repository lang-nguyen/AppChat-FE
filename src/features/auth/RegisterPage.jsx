import React, { useState, useEffect } from 'react';
import { useSocket } from '../../app/providers/SocketProvider.jsx';
import { Link, useNavigate } from 'react-router-dom';
import styles from './RegisterPage.module.css';

const RegisterPage = () => {
    const { actions, error, setError, isReady, registerSuccess, setRegisterSuccess } = useSocket();
    const navigate = useNavigate();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPass, setConfirmPass] = useState("");
    const [localError, setLocalError] = useState("");

    // 1. Reset lỗi & trạng thái cũ khi mới vào trang
    useEffect(() => {
        setError("");
        setLocalError("");
        setRegisterSuccess(false);
    }, []);

    // 2. Lắng nghe: Nếu đăng ký thành công -> Chuyển sang login
    useEffect(() => {
        if (registerSuccess) {
            alert("Đăng ký thành công! Hãy đăng nhập.");
            setRegisterSuccess(false); // Reset trạng thái
            navigate("/login");
        }
    }, [registerSuccess, navigate, setRegisterSuccess]);

    const handleRegister = (e) => {
        e.preventDefault();

        // Validate client
        if (password !== confirmPass) {
            setLocalError("Mật khẩu nhập lại không khớp!");
            return;
        }
        if (password.length < 3) { // Ví dụ validate độ dài
            setLocalError("Mật khẩu quá ngắn!");
            return;
        }

        if (!isReady) {
            setLocalError("Mất kết nối server!");
            return;
        }

        // Gọi action gửi lên server
        // Lúc này error global sẽ được reset bởi logic action hoặc handler
        setLocalError("");
        actions.register(username, password);
    };

    const handleTyping = (setter, value) => {
        setter(value);
        if (localError) setLocalError("");
        if (error) setError("");
    };

    return (
        <div className={styles.page}>
        <div className={styles.container}>
            <h2 className={styles.title}>Đăng Ký Tài Khoản</h2>

            {/* Trạng thái Server */}
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

            {/* Hiển thị lỗi (Ưu tiên lỗi từ server, sau đó đến lỗi local) */}
            {(error || localError) && (
                <div className={styles.errorBox}>
                     {error || localError}
                </div>
            )}

            <form onSubmit={handleRegister}>
                <div className={styles.field}>
                    <label className={styles.label}>Tài khoản:</label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => handleTyping(setUsername, e.target.value)}
                        required
                        placeholder="Chọn tên đăng nhập..."
                        className={styles.input}
                    />
                </div>

                <div className={styles.field}>
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

                <div className={styles.fieldLast}>
                    <label className={styles.label}>Nhập lại mật khẩu:</label>
                    <input
                        type="password"
                        value={confirmPass}
                        onChange={(e) => handleTyping(setConfirmPass, e.target.value)}
                        required
                        placeholder="Xác nhận mật khẩu..."
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
                    {isReady ? "Đăng Ký Ngay" : "Đang kết nối..."}
                </button>
            </form>

            <p className={styles.footer}>
                Đã có tài khoản? <Link to="/login" className={styles.link}>Đăng nhập</Link>
            </p>
        </div>
        </div>
    );
};

export default RegisterPage;