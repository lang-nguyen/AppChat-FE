import React, { useState, useEffect } from 'react';
import { useSocket } from '../../app/providers/SocketProvider.jsx';
import { useNavigate } from 'react-router-dom';
import colors from "../../shared/constants/colors.js";
import Register from "./components/Register.jsx";

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
		// setLocalError("");
		setRegisterSuccess(false);
	}, []);

	// 2. Lắng nghe: Nếu đăng ký thành công -> Chuyển sang components
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
		if (password.length < 3) {
			setLocalError("Mật khẩu quá ngắn!");
			return;
		}

		if (!isReady) {
			setLocalError("Mất kết nối server!");
			return;
		}

		setLocalError("");
		actions.register(username, password);
	};

	const handleTyping = (setter) => (e) => {
		setter(e.target.value);
		if (localError) setLocalError("");
		if (error) setError("");
	};

	return (
		<div
			style={{
				minHeight: '100vh',
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				background: `linear-gradient(135deg, ${colors.gradientStart}, ${colors.gradientEnd})`
			}}
		>
			<Register
				username={username}
				password={password}
				confirmPass={confirmPass}
				error={error}
				localError={localError}
				isReady={isReady}
				onUsernameChange={handleTyping(setUsername)}
				onPasswordChange={handleTyping(setPassword)}
				onConfirmChange={handleTyping(setConfirmPass)}
				onSubmit={handleRegister}
			/>
		</div>
	);
};

export default RegisterPage;