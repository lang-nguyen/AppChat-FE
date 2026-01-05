import React from 'react';
import colors from '../../../../shared/constants/colors.js';

const UserHeader = ({ name, onAdd, onLogout }) => (
	<div style={{
		display: 'flex',
		justifyContent: 'space-between',
		alignItems: 'center',
		padding: 16,
		color: colors.primaryText,
		fontWeight: 700,
		flexShrink: 0 
	}}>
		<span>{name}</span>
		<div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
			{onLogout && (
				<button onClick={onLogout} style={{
					borderRadius: '50%',
					border: `1px solid ${colors.cardBorder}`,
					width: 28,
					height: 28,
					cursor: 'pointer',
					background: 'transparent',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					color: colors.primaryText,
					fontSize: 14
				}} title="Đăng xuất">
					<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
						<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
						<polyline points="16 17 21 12 16 7"></polyline>
						<line x1="21" y1="12" x2="9" y2="12"></line>
					</svg>
				</button>
			)}
			<button onClick={onAdd} style={{
				borderRadius: '50%',
				border: `1px solid ${colors.cardBorder}`,
				width: 28,
				height: 28,
				cursor: 'pointer',
				background: 'transparent'
			}}>+</button>
		</div>
	</div>
);

export default UserHeader;