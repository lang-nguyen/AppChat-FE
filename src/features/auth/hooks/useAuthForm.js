import { useState } from 'react';
import { useSocket } from '../../../app/providers/SocketProvider';
import { authService } from '../services/authService';

// Custom Hook quản lý logic Form cho cả Login và Register
export const useAuthForm = (mode = 'LOGIN') => {
    const { actions, error, setError, isReady } = useSocket();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPass, setConfirmPass] = useState("");
    const [localError, setLocalError] = useState("");

    const handleTyping = (field, value) => {
        if (field === 'username') {
            setUsername(value);
        }
        if (field === 'password') setPassword(value);
        if (field === 'confirmPass') setConfirmPass(value);

        // Reset lỗi khi người dùng gõ
        if (localError) setLocalError("");
        if (error) setError("");
    };

    const handleSubmit = () => {
        if (!isReady) {
            setLocalError("Mất kết nối server! Vui lòng tải lại trang.");
            return;
        }

        if (mode === 'REGISTER') {
            // Validate cho Register
            if (password !== confirmPass) {
                setLocalError("Mật khẩu nhập lại không khớp!");
                return;
            }
            if (password.length < 3) {
                setLocalError("Mật khẩu phải dài hơn 3 ký tự!");
                return;
            }

            setLocalError("");
            authService.register(actions, username, password);

        } else {
            // Logic cho Login
            localStorage.setItem('user_name', username);
            authService.login(actions, username, password);
        }
    };

    return {
        // State
        username,
        password,
        confirmPass,
        localError,
        error, // global socket error
        isReady,

        // Actions
        handleTyping,
        handleSubmit
    };
};

