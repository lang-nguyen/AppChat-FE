import React from 'react';
import colors from '../../../../shared/constants/colors.js';
import HeaderInfo from './HeaderInfo.jsx';
import ListMember from './ListMember.jsx';
import InfoFunction from './InfoFunction.jsx';
import { useChatTheme } from '../../hooks/useChatTheme';
import ThemeSelectorModal from './ThemeSelectorModal.jsx';

import SharedMedia from './SharedMedia.jsx';

const ChatInfo = ({ isGroup = false, members = [], onRename, onChangeTheme, onLeaveRoom, onAddMember }) => (
    <div style={{
        width: 320,
        height: '100%',
        backgroundColor: colors.cardBackground,
        borderLeft: '1px solid #FFB3D9',
        display: 'flex',
        flexDirection: 'column'
    }}>
        <HeaderInfo />

        {/* Scroll */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
            <ListMember members={members} isGroup={isGroup} onAddMember={onAddMember} />
            <SharedMedia />
            <InfoFunction isGroup={isGroup} onRename={onRename} onChangeTheme={onChangeTheme} onLeaveRoom={onLeaveRoom} />
        </div>
    </div>
);

export default ChatInfo;
