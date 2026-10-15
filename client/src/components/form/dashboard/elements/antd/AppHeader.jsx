import React, {useEffect, useMemo, useRef, useState} from 'react';
import {Avatar, Badge, ConfigProvider, Layout, Tooltip, Typography} from 'antd';
import {
    BellOutlined,
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    UserOutlined,
} from '@ant-design/icons';
import NotificationPopover, {useNotificationCount} from '../../utilities/NotificationPopover';
import {useNavigate} from 'react-router-dom';

const {Header} = Layout;

/* ───────── Design tokens ───────── */
const C = {
    ink: '#0F172A',
    page: '#F4F5F9',
    card: '#FFFFFF',
    line: '#E6E8F0',
    muted: '#5B6478',
    primary: '#4F46E5',
    primaryDeep: '#4338CA',
    primarySoft: '#EEF0FF',
    primarySoftLine: '#C7CCF5',
    primarySoftText: '#3730A3',
    danger: '#BE123C',
};

const FONT = "'IBM Plex Sans Thai','Noto Sans Thai',system-ui,sans-serif";

const theme = {
    token: {colorPrimary: C.primary, borderRadius: 12, fontFamily: FONT, controlHeight: 44},
};

const css = `
.ah-header { font-family: ${FONT}; }

.ah-btn {
  display: inline-flex; align-items: center; justify-content: center;
  width: 44px; height: 44px; flex: none;
  border-radius: 12px; cursor: pointer;
  background: ${C.primarySoft};
  border: 1px solid ${C.primarySoftLine};
  color: ${C.primarySoftText};
  font-size: 18px; padding: 0;
  transition: background-color .15s ease, border-color .15s ease, color .15s ease;
}
.ah-btn:hover { background: ${C.primary}; border-color: ${C.primary}; color: #fff; }
.ah-btn:focus-visible { outline: 3px solid ${C.primarySoftLine}; outline-offset: 2px; }

.ah-btn--plain { background: ${C.card}; border-color: ${C.line}; color: ${C.muted}; }
.ah-btn--plain:hover { background: ${C.primarySoft}; border-color: ${C.primarySoftLine}; color: ${C.primarySoftText}; }

.ah-btn--avatar { border-radius: 999px; background: ${C.primarySoft}; border-color: ${C.primarySoftLine}; }
.ah-btn--avatar:hover { background: ${C.primarySoft}; border-color: ${C.primary}; }

.ah-title {
  flex: 1; min-width: 0; text-align: center; padding: 0 12px;
}
.ah-title h4.ant-typography {
  margin: 0 !important; color: ${C.ink} !important;
  font-size: 20px !important; font-weight: 700 !important; line-height: 1.3 !important;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.ah-title--missing h4.ant-typography { color: ${C.muted} !important; font-weight: 600 !important; }

.ah-right { display: flex; align-items: center; gap: 12px; flex: none; }

@media (max-width: 640px) {
  .ah-header { padding: 0 12px !important; }
  .ah-title h4.ant-typography { font-size: 16px !important; }
  .ah-right { gap: 8px; }
}
`;

function AppHeader({
                       setCollapsed,
                       collapsed,
                       apartmentData,
                       onNotificationClick,
                       onUserClick,
                   }) {
    const unreadCount = useNotificationCount();
    const navigate = useNavigate();

    const missingApartment = useMemo(() => !apartmentData?.result, [apartmentData]);

    // ✅ กัน modal เด้งซ้ำ / กัน data กระพริบ
    const shownRef = useRef(false);
    const [openModal, setOpenModal] = useState(false);

    useEffect(() => {
        if (missingApartment) {
            // ถ้าขาดจริง → เปิด (แต่กันเปิดซ้ำ)
            if (!shownRef.current) {
                shownRef.current = true;
                setOpenModal(true);
            } else {
                setOpenModal(true);
            }
        } else {
            // ถ้ามีค่าแล้ว → ปิด และรีเซ็ตให้พร้อมครั้งหน้า
            setOpenModal(false);
            shownRef.current = false;
        }
    }, [missingApartment]);

    const handleNotificationClick = (notification) => {
        onNotificationClick?.(notification);
    };

    const handleUserClick = () => {
        onUserClick?.();
    };

    const goSetting = () => {
        setOpenModal(false);
        navigate('/apartment/setting');
    };

    return (
        <ConfigProvider theme={theme}>
            <style>{css}</style>

            <Header
                className="ah-header"
                style={{
                    padding: '0 24px',
                    background: C.card,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 8,
                    height: 68,
                    lineHeight: 1,
                    borderBottom: `1px solid ${C.line}`,
                    position: 'sticky',
                    top: 0,
                    zIndex: 1000,
                }}
            >
                {/* Left */}
                <button
                    type="button"
                    className="ah-btn"
                    onClick={() => setCollapsed(!collapsed)}
                    aria-label={collapsed ? 'ขยายเมนู' : 'ย่อเมนู'}
                    aria-expanded={!collapsed}
                >
                    {collapsed ? <MenuUnfoldOutlined/> : <MenuFoldOutlined/>}
                </button>

                {/* Center */}
                <div className={`ah-title${missingApartment ? ' ah-title--missing' : ''}`}>
                    <Typography.Title level={4}>
                        {apartmentData?.result?.apartmentName ?? 'กรุณาตั้งค่าอพาร์ทเมนต์ของคุณ'}
                    </Typography.Title>
                </div>

                {/* Right */}
                <div className="ah-right">
                    <NotificationPopover onNotificationClick={handleNotificationClick} placement="bottomRight">
                        <Tooltip title="การแจ้งเตือน">
                            <button
                                type="button"
                                className="ah-btn ah-btn--plain"
                                aria-label="การแจ้งเตือน"
                            >
                                <Badge
                                    count={unreadCount}
                                    size="small"
                                    style={{backgroundColor: C.danger}}
                                >
                                    <BellOutlined style={{fontSize: 20, color: 'inherit'}}/>
                                </Badge>
                            </button>
                        </Tooltip>
                    </NotificationPopover>

                    <button
                        type="button"
                        className="ah-btn ah-btn--avatar"
                        onClick={handleUserClick}
                        aria-label="โปรไฟล์ผู้ใช้"
                    >
                        <Avatar
                            size={34}
                            style={{background: C.primary, color: '#fff'}}
                            icon={<UserOutlined/>}
                        />
                    </button>
                </div>
            </Header>
        </ConfigProvider>
    );
}

export default AppHeader;