import React from 'react';
import Card from '../../../../shared/components/Card.jsx';
import { getAvatarUrl } from '../../../../shared/utils/avatarUtils.js';
import { decodeEmoji } from '../../../../shared/utils/emojiUtils.js';

const RoomCard = ({ name, lastMessage, active, badge, onClick, isOnline }) => (
	<Card
		active={active}
		onClick={onClick}
		style={{
			margin: '8px 16px',
			display: 'flex',
			alignItems: 'center',
			gap: 12
		}}
	>
		<div style={{ position: 'relative', flexShrink: 0 }}>
			<div style={{
				width: 48,
				height: 48,
				borderRadius: '50%',
				backgroundColor: '#eee',
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				overflow: 'hidden'
			}}>
				<img
					src={getAvatarUrl(name, 48)}
					alt={name}
					style={{ width: '100%', height: '100%', objectFit: 'cover' }}
				/>
			</div>
			{isOnline !== undefined && (
				<div style={{
					position: 'absolute',
					bottom: -2,
					right: 2,
					width: 12,
					height: 12,
					borderRadius: '50%',
					backgroundColor: isOnline ? '#22c55e' : '#9ca3af',
					border: '2px solid #fff',
					boxShadow: '0 0 0 1px rgba(0,0,0,0.05)'
				}} />
			)}
		</div>

		<div style={{ flex: 1, minWidth: 0 }}>
			<div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
				<div style={{ fontSize: 18, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
					{name}
				</div>
				{badge && (
					<span style={{
						fontSize: 12,
						padding: '2px 8px',
						borderRadius: 999,
						background: '#ffffffaa',
						whiteSpace: 'nowrap',
						flexShrink: 0
					}}>
						{badge}
					</span>
				)}
			</div>
			<div style={{ fontSize: 15, opacity: 0.7, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
				{decodeEmoji(lastMessage)}
			</div>
		</div>
	</Card>
);

export default RoomCard;