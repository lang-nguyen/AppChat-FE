import React, { useState } from 'react';
import { useSocket } from '../../../app/providers/SocketProvider.jsx';
import colors from '../../../shared/constants/colors.js';
import LoginHeader from './components/LoginHeader.jsx';
import LoginFields from './components/LoginFields.jsx';
import LoginActions from './components/LoginActions.jsx';
import LoginFooter from './components/LoginFooter.jsx';

const LoginForm = () => {
    const { actions, error, setError, isReady } = useSocket();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const handleLogin = () => {
        if (!isReady) {
            alert("Mất kết nối server! Vui lòng tải lại trang.");
            return;
        }

        // Lưu trước username vào LocalStorage (để dành cho re-login)
        localStorage.setItem('user_name', username);

        actions.login(username, password);
    };

    const handleTyping = (field, value) => {
        if (field === 'username') setUsername(value);
        if (field === 'password') setPassword(value);

        if (error) setError("");
    };

    return (
        <div style={{ width: 350 }}>
            <LoginHeader />

            {/* Thông báo lỗi nếu có */}
            {error && (
                <div style={{
                    color: colors.errorText,
                    backgroundColor: '#ffe6e6',
                    padding: '8px 12px',
                    borderRadius: 6,
                    marginBottom: 15,
                    fontSize: 14,
                    textAlign: 'center'
                }}>
                    {error}
                </div>
            )}

            <LoginFields
                username={username}
                password={password}
                onTyping={handleTyping}
            />

            <LoginActions
                isReady={isReady}
                onLogin={handleLogin}
            />

            <LoginFooter />
        </div>
    );
};

export default LoginForm;
