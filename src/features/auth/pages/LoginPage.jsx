import React, { useEffect } from 'react';
import { useSocket } from '../../../app/providers/SocketProvider.jsx';
import { useNavigate } from 'react-router-dom';
import Card from '../../../shared/components/Card.jsx';
import LoginForm from '../login/LoginForm.jsx';
import styles from './AuthLayout.module.css';

const LoginPage = () => {
    // 1. Lấy "đồ nghề" từ Context mới
    const { user } = useSocket();

    // Hook điều hướng trang
    const navigate = useNavigate();

    // 2. Logic Tự động chuyển hướng
    // Mỗi khi biến 'user' thay đổi (do file socketHandlers cập nhật), hàm này sẽ chạy
    useEffect(() => {
        if (user) {
            console.log("Đăng nhập thành công, đang chuyển trang...");
            navigate("/chat"); // Chuyển sang trang Chat
        }
    }, [user, navigate]);

    return (
        <div className={styles.page}>
            <Card className={styles.card}>
                <LoginForm />
            </Card>
        </div>
    );
};

export default LoginPage;
