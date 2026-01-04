import React from 'react';
import RoomCard from './RoomCard.jsx';

const RoomList = ({ rooms, onSelect }) => (
	<div style={{ flex: 1, display: 'flex', flexDirection: 'column', paddingBottom: 10, width: '100%' }}>
		{rooms.map((r) => (
			<RoomCard
				key={r.key}
				name={r.name}
				type={r.type}
				badge={r.badge}
				lastMessage={r.lastMessage}
				active={r.active}
				isOnline={r.isOnline}
				onClick={() => {
					console.log('Room clicked:', r);
					onSelect?.(r);
				}}
			/>
		))}
	</div>
);

export default RoomList;