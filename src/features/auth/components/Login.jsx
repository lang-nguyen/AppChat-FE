import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../../../shared/components/Button.jsx';
import TextInput from '../../../shared/components/TextInput.jsx';
import colors from "../../../shared/constants/colors.js";

const Login = ({
	username,
	password,
	error,
	isReady,
	onUsernameChange,
	onPasswordChange,
	onSubmit
}) => {
	return (
		<div
			style={{
				width: 360,
				padding: 30,
				borderRadius: 12,
				background: colors.cardBackground,
				boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
				textAlign: 'center'
			}}
		>
			<h2 style={{ color: colors.primaryText, marginBottom: 20 }}>
				LangChat - SubeoApp
			</h2>

			{error && (
				<div
					style={{
						background: '#ffe6ea',
						color: colors.errorText,
						padding: 10,
						borderRadius: 6,
						marginBottom: 15,
						fontSize: 14
					}}
				>
					{error}
				</div>
			)}

			<form onSubmit={onSubmit}>
				<TextInput
					label="Tên người dùng"
					value={username}
					onChange={onUsernameChange}
					placeholder="Nhập tên của bạn"
					required
				/>

				<TextInput
					label="Mật khẩu"
					type="password"
					value={password}
					onChange={onPasswordChange}
					placeholder="Nhập mật khẩu"
					required
				/>

				<Button
					type="submit"
					disabled={!isReady}
				>
					{isReady ? 'Đăng nhập' : 'Đang kết nối...'}
				</Button>
			</form>

			<p style={{ marginTop: 18, fontSize: 14 }}>
				Bạn chưa có tài khoản?{' '}
				<Link
					to="/register"
					style={{ color: colors.primaryText, fontWeight: 600 }}
				>
					Tạo tài khoản tại đây
				</Link>
			</p>
		</div>
	);
};

export default Login;