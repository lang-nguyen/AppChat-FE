import React from 'react';
import colors from '../../../../shared/constants/colors.js';

const MessageSender = ({ text }) => (
	<div style={{
		alignSelf: 'flex-end',
		backgroundColor: colors.chatSenderBackground,
		color: colors.normalText,
		padding: 10,
		borderRadius: 12,
		marginBottom: 8,
		maxWidth: '60%'
	}}>
		{text}
	</div>
);

export default MessageSender;