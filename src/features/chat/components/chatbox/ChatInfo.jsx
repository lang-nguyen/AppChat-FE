import React from 'react';
import colors from '../../../../shared/constants/colors.js';
import HeaderInfo from './HeaderInfo.jsx';
import ListMember from './ListMember.jsx';
import InfoFunction from './InfoFunction.jsx';
import { useChatTheme } from '../../hooks/useChatTheme';
import ThemeSelectorModal from './ThemeSelectorModal.jsx';

const ChatInfo = ({ isGroup = false, members = [], onRename, onLeaveRoom, onAddMember }) => {
    const { changeTheme } = useChatTheme();
    const [showThemeSelector, setShowThemeSelector] = React.useState(false);

    return (
        <div style={{
            width: 320,
            height: '100%',
            backgroundColor: 'var(--theme-card-bg, #FFDAEB)',
            borderLeft: '1px solid var(--theme-border, #FFB3D9)',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative'
        }}>
            <HeaderInfo />
            <ListMember members={members} isGroup={isGroup} onAddMember={onAddMember} />
            <InfoFunction
                isGroup={isGroup}
                onRename={onRename}
                onChangeTheme={() => setShowThemeSelector(true)}
                onLeaveRoom={onLeaveRoom}
            />

            {showThemeSelector && (
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 100
                }}>
                    <ThemeSelectorModal
                        onClose={() => setShowThemeSelector(false)}
                        onSelect={changeTheme}
                    />
                </div>
            )}
        </div>
    );
};

export default ChatInfo;
