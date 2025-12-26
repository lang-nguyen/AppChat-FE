import React from 'react';
import colors from '../../../../shared/constants/colors.js';

const ChatHeader = ({ name }) => (
	<div style={{
		padding: 16,
		backgroundColor: colors.chatHeaderBackground,
		color: colors.normalText,
		display: 'flex',
		alignItems: 'center',
		gap: 15
	}}>
		<div style={{
			width: 45,
			height: 45,
			borderRadius: '50%',
			backgroundColor: '#000000ff',
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'center',
			overflow: 'hidden',
			border: '2px solid #fff'
		}}>
			<img
				src={`https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&size=128`}
				alt={name}
				style={{ width: '100%', height: '100%', objectFit: 'cover' }}
			/>
		</div>

		<strong style={{ fontSize: 24, color: 'Black' }}>{name}</strong>
	</div>
);

export default ChatHeader;