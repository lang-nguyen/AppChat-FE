import React from 'react';
import { Link } from 'react-router-dom';
import Button from './Button';
import colors from "../constants/colors.js";

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
				<div style={{ textAlign: 'left', marginBottom: 15 }}>
					<label>Tên người dùng</label>
					<input
						type="text"
						value={username}
						onChange={onUsernameChange}
						placeholder="Nhập tên của bạn"
						required
						style={{
							width: '100%',
							padding: 10,
							marginTop: 5,
							borderRadius: 6,
							border: 'none'
						}}
					/>
				</div>

				<div style={{ textAlign: 'left', marginBottom: 20 }}>
					<label>Mật khẩu</label>
					<input
						type="password"
						value={password}
						onChange={onPasswordChange}
						placeholder="Nhập mật khẩu"
						required
						style={{
							width: '100%',
							padding: 10,
							marginTop: 5,
							borderRadius: 6,
							border: 'none'
						}}
					/>
				</div>

				<Button
					text={isReady ? 'Đăng nhập' : 'Đang kết nối...'}
					disabled={!isReady}
				/>
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