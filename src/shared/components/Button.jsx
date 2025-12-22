import React from 'react';

const Button = ({ text, onClick, disabled = false }) => {
	return (
		<button
			onClick={onClick}
			disabled={disabled}
			style={{
				width: '100%',
				padding: '12px 0',
				backgroundColor: disabled ? '#ccc' : '#7A003C',
				color: '#fff',
				border: 'none',
				borderRadius: 8,
				fontSize: 16,
				fontWeight: 600,
				cursor: disabled ? 'not-allowed' : 'pointer',
				transition: '0.3s'
			}}
		>
			{text}
		</button>
	);
};

export default Button;