import React from 'react';
import colors from "../../../../shared/constants/colors.js";

const MessageReceiver = ({ text }) => (
	<div style={{
		alignSelf: 'flex-start',
		backgroundColor: colors.chatReceiverBackground,
		color: colors.normalText,
		padding: 10,
		borderRadius: 12,
		marginBottom: 8,
		maxWidth: '60%'
	}}>
		{text}
	</div>
);

export default MessageReceiver;