import React from 'react';
import MessageSender from './MessageSender.jsx';
import MessageReceiver from './MessageReceiver.jsx';

const MessageList = ({ messages }) => (
	<div style={{
		flex: 1,
		padding: 16,
		display: 'flex',
		flexDirection: 'column'
	}}>
		{messages.map((m, i) =>
			m.me
				? <MessageSender key={i} text={m.text} />
				: <MessageReceiver key={i} text={m.text} />
		)}
	</div>
);

export default MessageList;