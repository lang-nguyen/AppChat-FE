import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setError, setRegisterSuccess } from '../../../state/auth/authSlice';
import { useNavigate } from 'react-router-dom';
import Card from '../../../shared/components/Card.jsx';
import RegisterForm from '../register/RegisterForm.jsx';
import styles from './AuthLayout.module.css';

const RegisterPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    // 1. Reset lỗi & trạng thái cũ khi mới vào trang
    useEffect(() => {
        dispatch(setError(""));
        dispatch(setRegisterSuccess(false));
    }, [dispatch]);

    return (
        <div className={styles.page}>
            <Card className={styles.card}>
                <RegisterForm onRegisterSuccess={() => navigate('/login')} />
            </Card>
        </div>
    );
};

export default RegisterPage;
