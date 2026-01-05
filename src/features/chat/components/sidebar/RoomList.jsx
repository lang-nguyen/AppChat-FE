import React from 'react';
import RoomCard from './RoomCard.jsx';
import styles from '../../pages/ChatPage.module.css';

const RoomList = ({ rooms, onSelect }) => (
	<div
		className={styles['room-list-scrollable']}
		style={{
			flex: 1,
			minHeight: 0,
			overflowY: 'auto',
			overflowX: 'hidden',
			display: 'flex',
			flexDirection: 'column',
			paddingBottom: 10,
			width: '100%'
		}}
	>
		{rooms.map(r => {
			const { key, ...roomProps } = r;
			return (
				<RoomCard
					key={key ?? `${r.type}:${r.name}`}
					{...roomProps}
					onClick={() => {
						console.log('Room clicked:', r);
						onSelect?.(r);
					}}
				/>
			);
		})}
	</div>
);

export default RoomList;