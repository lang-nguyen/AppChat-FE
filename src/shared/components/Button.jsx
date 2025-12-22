import React from 'react';
import colors from "../constants/colors.js";

const Button = ({ text, disabled }) => {
	return (
		<button
			type="submit"
			disabled={disabled}
			style={{
				width: '100%',
				padding: '12px 0',
				backgroundColor: disabled
					? colors.disabledButton
					: colors.primaryButton,
				color: '#fff',
				border: 'none',
				borderRadius: 8,
				fontSize: 16,
				fontWeight: 600,
				cursor: disabled ? 'not-allowed' : 'pointer'
			}}
		>
			{text}
		</button>
	);
};

export default Button;