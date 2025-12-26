import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../../../shared/components/Button.jsx';
import TextInput from '../../../shared/components/TextInput.jsx';
import colors from "../../../shared/constants/colors.js";

const Register = ({
	username,
	password,
	confirmPass,
	error,
	localError,
	isReady,
	onUsernameChange,
	onPasswordChange,
	onConfirmChange,
	onSubmit
}) => {
	return (
		<div
			style={{
				width: 360,
				padding: 30,
				borderRadius: 12,
				background: colors.cardBackground,
				boxShadow: `0 10px 30px ${colors.cardShadow}`,
				textAlign: 'center'
			}}
		>
			<h2 style={{ color: colors.primaryText, marginBottom: 20 }}>
				LangChat - SubeoApp
			</h2>

			{(error || localError) && (
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
					{error || localError}
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

				<TextInput
					label="Xác nhận mật khẩu"
					type="password"
					value={confirmPass}
					onChange={onConfirmChange}
					placeholder="Nhập lại mật khẩu"
					required
				/>

				<Button
					type="submit"
					disabled={!isReady}
				>
					{isReady ? 'Đăng ký' : 'Đang kết nối...'}
				</Button>
			</form>

			<p style={{ marginTop: 18, fontSize: 14 }}>
				Bạn đã có tài khoản?{' '}
				<Link
					to="/login"
					style={{ color: colors.primaryText, fontWeight: 600 }}
				>
					Đăng nhập tại đây
				</Link>
			</p>
		</div>
	);
};

export default Register;