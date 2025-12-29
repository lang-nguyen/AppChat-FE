import React from 'react';
import colors from '../../../../shared/constants/colors.js';

const AddMember = ({ onClick }) => (
    <button
        onClick={onClick}
        style={{
            backgroundColor: colors.normalText,
            color: '#fff',
            border: 'none',
            borderRadius: 16,
            padding: '6px 16px',
            cursor: 'pointer',
            fontSize: 13
        }}
    >
        + Thêm thành viên
    </button>
);

export default AddMember;
