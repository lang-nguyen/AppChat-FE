import React, { useState, useEffect } from 'react';
import { useSocket } from '../../app/providers/SocketProvider.jsx';
import { Link, useNavigate } from 'react-router-dom';

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

        actions.login(username, password);
    };

	const handleUsernameChange = (e) => {
		setUsername(e.target.value);
		if (error) setError('');
	};

	const handlePasswordChange = (e) => {
		setPassword(e.target.value);
		if (error) setError('');
	};

	return (
		<div
			style={{
				minHeight: '100vh',
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				background: 'linear-gradient(135deg, #FFB2CD, #FF5BCB)'
			}}
		>
			<Login
				username={username}
				password={password}
				error={error}
				isReady={isReady}
				onUsernameChange={handleUsernameChange}
				onPasswordChange={handlePasswordChange}
				onSubmit={handleLogin}
			/>
		</div>
	);
};

export default LoginPage;