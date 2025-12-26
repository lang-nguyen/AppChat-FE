import React from 'react';
import colors from "../constants/colors.js";

const Card = ({ children, active, onClick, style = {} }) => {
    return (
        <div
            onClick={onClick}
            style={{
                padding: 12,
                borderRadius: 12,
                backgroundColor: active ? colors.gradientStart : '#FFFFFF',
	            color: '#000000',
                border: `1px solid ${colors.cardBorderLight}`,
                boxShadow: colors.cardShadow ? `0 2px 4px ${colors.cardShadow}` : 'none',
                cursor: 'pointer',
                transition: 'background-color 0.2s',
                ...style
            }}
        >
            {children}
        </div>
    );
};

export default Card;
