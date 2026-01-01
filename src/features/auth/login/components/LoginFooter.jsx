import React from 'react';
import colors from '../../../../shared/constants/colors.js';
import { Link } from 'react-router-dom';

const LoginFooter = () => {
    return (
        <div style={{
            textAlign: 'center',
            fontSize: 13,
            marginTop: 15,
            color: colors.primaryText
        }}>
            Chưa có tài khoản? <Link to="/register" style={{ fontWeight: 'bold', textDecoration: 'none', color: colors.primaryText }}>Đăng ký ngay</Link>
        </div>
    );
};

export default LoginFooter;
