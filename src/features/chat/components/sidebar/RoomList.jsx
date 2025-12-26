import React from 'react';
import RoomCard from './RoomCard.jsx';

const RoomList = ({ rooms }) => (
	<div>
		{rooms.map(r => (
			<RoomCard key={r.id} {...r} />
		))}
	</div>
);

export default RoomList;