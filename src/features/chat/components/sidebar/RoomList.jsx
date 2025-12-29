import React from 'react';
import RoomCard from './RoomCard.jsx';

const RoomList = ({ rooms, onSelect }) => (
	<div>
		{rooms.map(r => (
			<RoomCard
				key={r.key ?? `${r.type}:${r.name}`}
				{...r}
				onClick={() => onSelect?.(r)}
			/>
		))}
	</div>
);

export default RoomList;