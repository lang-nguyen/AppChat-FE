import React from 'react';
import colors from '../../../../shared/constants/colors.js';

const HeaderInfo = () => (
    <div style={{
        padding: 16,
        backgroundColor: colors.chatHeaderBackground,
        color: colors.normalText,
        fontWeight: 'bold',
        fontSize: 18,
        height: 77,
        boxSizing: 'border-box',
        display: 'flex',
        alignItems: 'center'
    }}>
        Chi tiết
    </div>
);

export default HeaderInfo;
