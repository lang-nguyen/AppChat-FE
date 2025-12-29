import React from 'react';
import colors from '../../../../shared/constants/colors.js';

const ChatPlaceholder = () => (
	<div style={{
		height: '100%',
		display: 'flex',
		flexDirection: 'column',
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: '#FFE5F0',
		color: colors.primaryText
	}}>
		<div style={{ fontSize: 64, marginBottom: 16 }}>✈️</div>
		<h2 style={{ margin: 0, fontSize: 28, fontWeight: 'bold' }}>LangChat - SubeoApp</h2>
	</div>
);

export default ChatPlaceholder;