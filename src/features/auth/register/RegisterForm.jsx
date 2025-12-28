import React, { useState } from 'react';
import { useSocket } from '../../../app/providers/SocketProvider.jsx';
import colors from '../../../shared/constants/colors.js';
import RegisterHeader from './components/RegisterHeader.jsx';
import RegisterFields from './components/RegisterFields.jsx';
import RegisterActions from './components/RegisterActions.jsx';
import RegisterFooter from './components/RegisterFooter.jsx';

const RegisterForm = ({ onRegisterSuccess }) => {
    const { actions, error, setError, isReady } = useSocket();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPass, setConfirmPass] = useState("");
    const [localError, setLocalError] = useState("");

    const handleTyping = (field, value) => {
        if (field === 'username') setUsername(value);
        if (field === 'password') setPassword(value);
        if (field === 'confirmPass') setConfirmPass(value);

        if (localError) setLocalError("");
        if (error) setError("");
    };

    const handleRegister = () => {
        // Validate client
        if (password !== confirmPass) {
            setLocalError("Mật khẩu nhập lại không khớp!");
            return;
        }
        if (password.length < 3) {
            setLocalError("Mật khẩu phải dài hơn 3 ký tự!");
            return;
        }

        if (!isReady) {
            setLocalError("Mất kết nối server!");
            return;
        }

        setLocalError("");
        actions.register(username, password);
    };

    return (
        <div style={{ width: 350 }}>
            <RegisterHeader />

            {/* Hiển thị lỗi */}
            {(error || localError) && (
                <div style={{
                    color: colors.errorText,
                    backgroundColor: '#ffe6e6',
                    padding: '8px 12px',
                    borderRadius: 6,
                    marginBottom: 15,
                    fontSize: 14,
                    textAlign: 'center'
                }}>
                    {error || localError}
                </div>
            )}

            <RegisterFields
                username={username}
                password={password}
                confirmPass={confirmPass}
                onTyping={handleTyping}
            />

            <RegisterActions
                isReady={isReady}
                onRegister={handleRegister}
            />

            <RegisterFooter onNavigateLogin={onRegisterSuccess} />
        </div>
    );
};

export default RegisterForm;
