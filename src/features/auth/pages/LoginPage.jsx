import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setError } from '../../../state/auth/authSlice';
import { useNavigate } from 'react-router-dom';
import Card from '../../../shared/components/Card.jsx';
import LoginForm from '../login/LoginForm.jsx';
import styles from './AuthLayout.module.css';

const LoginPage = () => {
    // 1. Lấy user từ Redux
    const user = useSelector(state => state.auth.user);

    // Hook điều hướng trang
    const navigate = useNavigate();
    const dispatch = useDispatch();

    // 1b. Reset lỗi khi mới vào trang
    useEffect(() => {
        dispatch(setError(""));
    }, [dispatch]);

    // 2. Logic Tự động chuyển hướng nếu đã login
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
