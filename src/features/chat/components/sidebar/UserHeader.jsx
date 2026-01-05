import React from 'react';
import colors from '../../../../shared/constants/colors.js';

const UserHeader = ({ name, onAdd }) => (
	<div style={{
		display: 'flex',
		justifyContent: 'space-between',
		alignItems: 'center',
		padding: 16,
		color: colors.primaryText,
		fontWeight: 700,
		flexShrink: 0 
	}}>
		<span>{name}</span>
		<button onClick={onAdd} style={{
			borderRadius: '50%',
			border: `1px solid ${colors.cardBorder}`,
			width: 28,
			height: 28,
			cursor: 'pointer',
			background: 'transparent'
		}}>+</button>
	</div>
);

export default UserHeader;