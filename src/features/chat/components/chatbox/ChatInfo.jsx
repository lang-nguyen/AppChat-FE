import React, { useState } from 'react';
import HeaderInfo from './HeaderInfo.jsx';
import ListMember from './ListMember.jsx';
import InfoFunction from './InfoFunction.jsx';
import SharedMedia from "./SharedMedia.jsx";
import colors from '../../../../shared/constants/colors';
import ThemeSelectorModal from './ThemeSelectorModal.jsx';

const ChatInfo = ({ isGroup = false, members = [], onRename, onChangeTheme, onLeaveRoom, onAddMember }) => {
    const [showThemeSelector, setShowThemeSelector] = useState(false);

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

            {/* Scroll */}
            <div style={{ flex: 1, overflowY: 'auto' }}>
                <ListMember members={members} isGroup={isGroup} onAddMember={onAddMember} />
                <SharedMedia />
                <InfoFunction
                    isGroup={isGroup}
                    onRename={onRename}
                    onChangeTheme={() => setShowThemeSelector(true)}
                    onLeaveRoom={onLeaveRoom}
                />
            </div>

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
                        onSelect={(themeId) => {
                            onChangeTheme(themeId);
                            setShowThemeSelector(false);
                        }}
                    />
                </div>
            )}
        </div>
    );
};

export default ChatInfo;
