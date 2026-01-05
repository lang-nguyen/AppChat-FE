import React from 'react';
import SearchBar from '../../../../shared/components/SearchBar.jsx';

const SearchBox = () => (
	<div style={{ margin: '0 16px 12px', flexShrink: 0 }}>
		<SearchBar
			placeholder="Tìm kiếm phòng chat"
		/>
	</div>
);

export default SearchBox;