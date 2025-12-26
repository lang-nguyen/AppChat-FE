import React from 'react';

import colors from '../../../../shared/constants/colors.js';

const Composer = () => (
	<div style={{
		display: 'flex',
		alignItems: 'center',
		padding: 12,
		gap: 8,
		backgroundColor: '#fff'
	}}>
		<div style={{ position: 'relative', width: '100%' }}>
			{/* Icon Mặt cười */}
			<div style={{
				position: 'absolute',
				left: 12,
				top: '50%',
				transform: 'translateY(-50%)',
				cursor: 'pointer', // Cho phép click
				display: 'flex',
				alignItems: 'center',
				color: '#666'
			}}>
				<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
					<circle cx="12" cy="12" r="10" />
					<path d="M8 14s1.5 2 4 2 4-2 4-2" />
					<line x1="9" y1="9" x2="9.01" y2="9" />
					<line x1="15" y1="9" x2="15.01" y2="9" />
				</svg>
			</div>

			<input
				placeholder="Soạn tin nhắn"
				style={{
					width: '100%',
					backgroundColor: '#FFFFFF',
					color: '#000000',
					padding: '12px 12px 12px 40px',
					borderRadius: 24,
					border: `1px solid ${colors.cardBorder}`,
					outline: 'none',
					fontSize: 15,
					boxSizing: 'border-box'
				}}
			/>
		</div>
	</div>
);

export default Composer;