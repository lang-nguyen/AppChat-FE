import React from 'react';
import colors from '../../../../shared/constants/colors.js';

const ChatPlaceholder = () => (
	<div style={{
		height: '100%',
		display: 'flex',
		flexDirection: 'column',
		justifyContent: 'center',
		alignItems: 'center',
		color: colors.primaryText
	}}>
		<div style={{ fontSize: 32 }}>✈️</div>
		<h2>LangChat - SubeoApp</h2>
	</div>
);

export default ChatPlaceholder;