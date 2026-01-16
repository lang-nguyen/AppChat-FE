import React from 'react';
import colors from "../constants/colors.js";

const Card = ({ children, active, onClick, style = {} }) => {
    const [isHovered, setIsHovered] = React.useState(false);

    return (
        <div
            onClick={onClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            style={{
                padding: 12,
                borderRadius: 12,
                backgroundColor: active ? colors.gradientStart : (isHovered ? '#FFE5F0' : '#FFFFFF'), // Màu hồng nhạt khi hover
                color: '#000000',
                border: `1px solid ${colors.cardBorderLight}`,
                boxShadow: colors.cardShadow ? `0 2px 4px ${colors.cardShadow}` : 'none',
                cursor: 'pointer',
                transition: 'background-color 0.2s',
                position: 'relative',
                zIndex: 1,
                ...style
            }}
        >
            {children}
        </div>
    );
};

export default Card;
