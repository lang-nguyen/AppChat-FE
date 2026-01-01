import React from 'react';
import colors from '../../../../shared/constants/colors.js';

const MessageSender = ({ text, timestamp }) => (
	<div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', marginBottom: 12 }}>
		<div style={{
			backgroundColor: colors.chatSenderBackground,
			color: colors.normalText,
			padding: '10px 14px',
			borderRadius: 12,
			maxWidth: '60%'
		}}>
			{text}
		</div>
		{timestamp && <span style={{ fontSize: 11, color: '#999', marginTop: 4 }}>{timestamp}</span>}
	</div>
);

export default MessageSender;