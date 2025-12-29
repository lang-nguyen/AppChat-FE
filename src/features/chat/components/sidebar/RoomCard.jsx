import React from 'react';
import Card from '../../../../shared/components/Card.jsx';

const RoomCard = ({ name, lastMessage, active, badge, onClick }) => (
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
		<div style={{
			width: 48,
			height: 48,
			borderRadius: '50%',
			backgroundColor: '#eee',
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'center',
			flexShrink: 0,
			overflow: 'hidden'
		}}>
			<img
				src={`https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`}
				alt={name}
				style={{ width: '100%', height: '100%', objectFit: 'cover' }}
			/>
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
				{lastMessage}
			</div>
		</div>
	</Card>
);

export default RoomCard;