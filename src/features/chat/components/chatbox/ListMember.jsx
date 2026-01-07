import React from 'react';
import colors from '../../../../shared/constants/colors.js';
import AddMember from './AddMember.jsx';

const ListMember = ({ members = [], isGroup = false, onAddMember }) => (
    <div style={{ padding: 16, borderBottom: '1px solid #FFB3D9' }}>
        <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 12
        }}>
            <h3 style={{ margin: 0, fontSize: 16, color: colors.normalText }}>Thành viên</h3>
            {isGroup && <AddMember onClick={onAddMember} />}
        </div>

        {/* Danh sách members */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {members.map((member, idx) => (
                <div key={idx} style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: 8,
                    borderRadius: 8,
                    backgroundColor: '#fff'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ position: 'relative' }}>
                            <div style={{
                                width: 40,
                                height: 40,
                                borderRadius: '50%',
                                backgroundColor: '#ddd',
                                overflow: 'hidden'
                            }}>
                                <img
                                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=random&size=128`}
                                    alt={member.name}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                            </div>
                            <div style={{
                                position: 'absolute',
                                bottom: 0,
                                right: 0,
                                width: 10,
                                height: 10,
                                borderRadius: '50%',
                                backgroundColor: member.isOnline ? colors.online : colors.offline,
                                border: '2px solid #fff'
                            }} />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <strong style={{ fontSize: 15, color: colors.normalText }}>{member.name}</strong>
                            {member.isOwner}
                        </div>
                    </div>
                    <button
                        style={{
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: 18,
                            color: colors.normalText,
                            width: 20,
                            height: 35,
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'background-color 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.border = colors.normalText}
                        onMouseLeave={(e) => e.currentTarget.style.border = 'transparent'}
                    >⋮</button>
                </div>
            ))}
        </div>
    </div>
);

export default ListMember;
