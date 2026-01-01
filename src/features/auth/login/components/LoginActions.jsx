import React from 'react';
import Button from '../../../../shared/components/Button.jsx';
import colors from '../../../../shared/constants/colors.js';

const LoginActions = ({ isReady, onLogin }) => {
    return (
        <Button
            disabled={!isReady}
            onClick={onLogin}
            style={{
                backgroundColor: colors.primaryButton,
                marginTop: 10
            }}
        >
            {isReady ? "Đăng Nhập" : "Đang kết nối..."}
        </Button>
    );
};

export default LoginActions;
