import React from 'react';
import colors from "../../../../shared/constants/colors.js";

const MessageReceiver = ({ text, sender, timestamp, showAvatar = true }) => (
	<div style={{ display: 'flex', gap: 8, marginBottom: 12, alignItems: 'center' }}>
		{showAvatar && (
			<div style={{
				width: 32,
				height: 32,
				borderRadius: '50%',
				overflow: 'hidden',
				flexShrink: 0
			}}>
				<img
					src={`https://ui-avatars.com/api/?name=${encodeURIComponent(sender)}&background=random&size=64`}
					alt={sender}
					style={{ width: '100%', height: '100%', objectFit: 'cover' }}
				/>
			</div>
		)}
		{!showAvatar && <div style={{ width: 32, flexShrink: 0 }} />}
		<div style={{ display: 'flex', flexDirection: 'column', maxWidth: '60%' }}>
			{showAvatar && <span style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>{sender}</span>}
			<div style={{
				backgroundColor: colors.chatReceiverBackground,
				color: colors.normalText,
				padding: '10px 14px',
				borderRadius: 12,
				border: '1px solid #E0E0E0'
			}}>
				{text}
			</div>
			{timestamp && <span style={{ fontSize: 11, color: '#999', marginTop: 4 }}>{timestamp}</span>}
		</div>
	</div>
);

export default MessageReceiver;