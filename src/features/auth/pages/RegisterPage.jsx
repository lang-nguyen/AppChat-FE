import React, { useEffect } from 'react';
import { useSocket } from '../../../app/providers/SocketProvider.jsx';
import { useNavigate } from 'react-router-dom';
import Card from '../../../shared/components/Card.jsx';
import RegisterForm from '../register/RegisterForm.jsx';
import styles from './AuthLayout.module.css';

const RegisterPage = () => {
    const { setError, setRegisterSuccess, registerSuccess } = useSocket();
    const navigate = useNavigate();

    // 1. Reset lỗi & trạng thái cũ khi mới vào trang
    useEffect(() => {
        setError("");
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

    return (
        <div className={styles.page}>
            <Card className={styles.card}>
                <RegisterForm onRegisterSuccess={() => navigate('/login')} />
            </Card>
        </div>
    );
};

export default RegisterPage;
