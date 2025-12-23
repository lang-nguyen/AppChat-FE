import React, { useState, useEffect } from 'react';
import { useSocket } from '../../app/providers/SocketProvider.jsx';
import { Link, useNavigate } from 'react-router-dom';

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
        <div style={{ maxWidth: 400, margin: '50px auto', padding: 30, border: '1px solid #ddd', borderRadius: 10, boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
            <h2 style={{ textAlign: 'center', color: '#333' }}>Đăng Ký Tài Khoản</h2>

            {/* Trạng thái Server */}
            <div style={{ textAlign: 'center', marginBottom: 20, fontSize: 14 }}>
                Server:
                <span style={{ color: isReady ? 'green' : 'red', fontWeight: 'bold', marginLeft: 5 }}>
                    {isReady ? "Online" : "Offline"}
                </span>
            </div>

            {/* Hiển thị lỗi (Ưu tiên lỗi từ server, sau đó đến lỗi local) */}
            {(error || localError) && (
                <div style={{ background: '#ffebee', color: '#c62828', padding: 10, borderRadius: 5, marginBottom: 15, fontSize: 14 }}>
                     {error || localError}
                </div>
            )}

            <form onSubmit={handleRegister}>
                <div style={{ marginBottom: 15 }}>
                    <label style={{ display: 'block', marginBottom: 5, fontWeight: 500 }}>Tài khoản:</label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => handleTyping(setUsername, e.target.value)}
                        required
                        placeholder="Chọn tên đăng nhập..."
                        style={{ width: '100%', padding: 10, borderRadius: 5, border: '1px solid #ccc', boxSizing: 'border-box' }}
                    />
                </div>

                <div style={{ marginBottom: 15 }}>
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

                <div style={{ marginBottom: 20 }}>
                    <label style={{ display: 'block', marginBottom: 5, fontWeight: 500 }}>Nhập lại mật khẩu:</label>
                    <input
                        type="password"
                        value={confirmPass}
                        onChange={(e) => handleTyping(setConfirmPass, e.target.value)}
                        required
                        placeholder="Xác nhận mật khẩu..."
                        style={{ width: '100%', padding: 10, borderRadius: 5, border: '1px solid #ccc', boxSizing: 'border-box' }}
                    />
                </div>

                <button
                    type="submit"
                    disabled={!isReady}
                    style={{
                        width: '100%',
                        padding: 12,
                        background: isReady ? '#28a745' : '#ccc', // Màu xanh lá cho đăng ký
                        color: 'white',
                        border: 'none',
                        borderRadius: 5,
                        fontSize: 16,
                        fontWeight: 'bold',
                        cursor: isReady ? 'pointer' : 'not-allowed',
                        transition: '0.3s'
                    }}
                >
                    {isReady ? "Đăng Ký Ngay" : "Đang kết nối..."}
                </button>
            </form>

            <p style={{ marginTop: 20, textAlign: 'center', fontSize: 14 }}>
                Đã có tài khoản? <Link to="/login" style={{ color: '#007bff', textDecoration: 'none' }}>Đăng nhập</Link>
            </p>
        </div>
    );
};

export default RegisterPage;