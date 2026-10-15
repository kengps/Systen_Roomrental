import {LogoutOutlined, MenuOutlined, UserOutlined} from '@ant-design/icons';
import {Avatar, Button, ConfigProvider, Drawer, Layout, Menu, Typography} from 'antd';
import React, {startTransition, useEffect, useState} from 'react';
import {useMobile} from '../../../../../contexts/MobileContext';

const {Sider} = Layout;
const {Text} = Typography;

const SIDEBAR_WIDTH = 260;
const SIDEBAR_COLLAPSED_WIDTH = 80;
const MOBILE_HEADER_HEIGHT = 64;

/* ------------------------------------------------------------------ */
/* Design tokens (ชุดเดียวกับหน้า ListRoom / BillingForm)              */
/* ------------------------------------------------------------------ */
const C = {
    ink: '#0F172A',
    raised: '#1E2A4A',
    line: '#1E2A4A',
    text: '#FFFFFF',
    muted: '#A5B0C6',
    primary: '#4F46E5',
    primaryTint: '#C7D2FE',
    danger: '#FB7185',
};

const FONT = "'IBM Plex Sans Thai','Noto Sans Thai',system-ui,sans-serif";

// ธีมเมนูเฉพาะใน sidebar — ไม่กระทบเมนูส่วนอื่นของแอป
const menuTheme = {
    token: {fontFamily: FONT, colorPrimary: C.primary},
    components: {
        Menu: {
            darkItemBg: 'transparent',
            darkSubMenuItemBg: 'transparent',
            darkPopupBg: C.ink,
            darkItemColor: C.muted,
            darkItemHoverBg: 'rgba(255,255,255,0.06)',
            darkItemHoverColor: C.text,
            darkItemSelectedBg: C.raised,
            darkItemSelectedColor: C.text,
            itemBorderRadius: 12,
            itemHeight: 44,
            itemMarginInline: 12,
            itemMarginBlock: 2,
            iconSize: 18,
            collapsedIconSize: 20,
            groupTitleColor: '#7C879D',
        },
    },
};

const css = `
.as-scroll { scrollbar-width: thin; scrollbar-color: ${C.raised} transparent; }
.as-scroll::-webkit-scrollbar { width: 6px; }
.as-scroll::-webkit-scrollbar-thumb { background: ${C.raised}; border-radius: 3px; }
.as-logout { transition: background .15s ease, border-color .15s ease; }
.as-logout:hover { background: rgba(251,113,133,0.12) !important; border-color: rgba(251,113,133,0.45) !important; color: ${C.danger} !important; }
.as-icon-btn { transition: background .15s ease; }
.as-icon-btn:hover { background: rgba(255,255,255,0.08) !important; color: #fff !important; }
.as-sider button:focus-visible, .as-mobile-bar button:focus-visible { outline: 2px solid #818CF8; outline-offset: 2px; }
`;

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */
const resolveUserData = (user) => {
    if (user?.userPayLoad?.user) {
        return {
            username: user.userPayLoad.user.username,
            role: user.userPayLoad.user.role,
        };
    }
    try {
        const store = JSON.parse(localStorage.getItem('auth-storage'));
        if (store?.state?.user?.userPayLoad?.user) {
            return {
                username: store.state.user.userPayLoad.user.username,
                role: store.state.user.userPayLoad.user.role,
            };
        }
    } catch {
        return {username: '', role: ''};
    }
    return {username: '', role: ''};
};

/* ------------------------------------------------------------------ */
/* Small pieces                                                        */
/* ------------------------------------------------------------------ */
const BrandMark = ({size = 40}) => (
    <span
        aria-hidden="true"
        style={{
            flex: '0 0 auto', width: size, height: size, borderRadius: size * 0.3, background: C.primary,
            color: '#fff', fontSize: size * 0.5, fontWeight: 800, lineHeight: 1,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
    >
        G
    </span>
);

const RolePill = ({role}) =>
    role ? (
        <span
            style={{
                display: 'inline-block', marginTop: 2, padding: '1px 8px', borderRadius: 999,
                background: 'rgba(99,102,241,0.2)', color: C.primaryTint, fontSize: 11, fontWeight: 600, lineHeight: '18px',
            }}
        >
            {role}
        </span>
    ) : null;

const UserBlock = ({name, role, username, compact}) => (
    <div style={{display: 'flex', alignItems: 'center', gap: 12, minWidth: 0, justifyContent: compact ? 'center' : 'flex-start'}}>
        <Avatar
            size={compact ? 36 : 40}
            icon={<UserOutlined/>}
            style={{flex: '0 0 auto', background: C.raised, color: '#A5B4FC'}}
        />
        {!compact && (
            <div style={{minWidth: 0, flex: 1}}>
                <Text
                    title={username}
                    style={{
                        color: C.text, fontSize: 14, fontWeight: 600, display: 'block', lineHeight: 1.3,
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}
                >
                    {name}
                </Text>
                <RolePill role={role}/>
            </div>
        )}
    </div>
);

const LogoutButton = ({onClick, collapsed}) => (
    <Button
        type="text"
        icon={<LogoutOutlined/>}
        onClick={onClick}
        block
        aria-label="ออกจากระบบ"
        className="as-logout"
        style={{
            height: 48, borderRadius: 12, color: C.danger, fontWeight: 600,
            display: 'flex', alignItems: 'center', gap: 8,
            justifyContent: collapsed ? 'center' : 'flex-start',
            paddingInline: collapsed ? 0 : 16,
            border: '1px solid rgba(251,113,133,0.25)',
        }}
    >
        {!collapsed && <span>ออกจากระบบ</span>}
    </Button>
);

/* ------------------------------------------------------------------ */
/* Main                                                                */
/* ------------------------------------------------------------------ */
const AppSidebar = ({collapsed, handleMenuClick, menuItems, onOpenChange, openKeys, user}) => {
    const {isMobile, mobileMenuOpen, setMobileMenuOpen} = useMobile();
    const [userData, setUserData] = useState({username: '', role: ''});

    useEffect(() => {
        setUserData(resolveUserData(user));
    }, [user]);

    const handleLogoutClick = () => handleMenuClick({key: 'logout'});

    // ถ้าหน้าปลายทางเป็น lazy route (โหลดไฟล์ครั้งแรก) ให้ React คงหน้าเดิมไว้จนกว่าจะพร้อม
    // แทนที่จะโชว์ Suspense fallback แวบหนึ่ง
    const handleItemClick = (e) => startTransition(() => handleMenuClick(e));
    const displayName = (userData.username || '').split('@')[0];

    const menu = (onClick) => (
        <Menu
            mode="inline"
            theme="dark"
            onClick={onClick}
            items={menuItems}
            onOpenChange={onOpenChange}
            openKeys={openKeys}
            style={{border: 'none', background: 'transparent'}}
        />
    );

    /* ============================ Mobile ============================ */
    if (isMobile) {
        return (
            <ConfigProvider theme={menuTheme}>
                <style>{css}</style>

                <div
                    className="as-mobile-bar"
                    style={{
                        position: 'fixed', top: 0, left: 0, right: 0, height: MOBILE_HEADER_HEIGHT, zIndex: 1000,
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
                        padding: '0 16px', background: C.ink, borderBottom: `1px solid ${C.line}`, fontFamily: FONT,
                    }}
                >
                    <div style={{display: 'flex', alignItems: 'center', gap: 12, minWidth: 0, flex: 1}}>
                        <BrandMark size={36}/>
                        <div style={{minWidth: 0}}>
                            <Text
                                title={userData.username}
                                style={{
                                    color: C.text, fontSize: 14, fontWeight: 600, display: 'block', lineHeight: 1.3,
                                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                }}
                            >
                                {displayName}
                            </Text>
                            <Text style={{color: C.muted, fontSize: 12}}>{userData.role}</Text>
                        </div>
                    </div>

                    <div style={{display: 'flex', gap: 8}}>
                        <Button
                            type="text"
                            aria-label="เปิดเมนู"
                            icon={<MenuOutlined/>}
                            onClick={() => setMobileMenuOpen(true)}
                            className="as-icon-btn"
                            style={{width: 44, height: 44, borderRadius: 12, color: C.muted, border: `1px solid ${C.raised}`}}
                        />
                        <Button
                            type="text"
                            aria-label="ออกจากระบบ"
                            icon={<LogoutOutlined/>}
                            onClick={handleLogoutClick}
                            className="as-logout"
                            style={{width: 44, height: 44, borderRadius: 12, color: C.danger, border: '1px solid rgba(251,113,133,0.25)'}}
                        />
                    </div>
                </div>

                <Drawer
                    open={mobileMenuOpen}
                    onClose={() => setMobileMenuOpen(false)}
                    placement="left"
                    closeIcon={false}
                    width={SIDEBAR_WIDTH}
                    styles={{
                        body: {padding: 0, background: C.ink},
                        header: {display: 'none'},
                        mask: {backgroundColor: 'rgba(15,23,42,0.5)'},
                    }}
                    style={{marginTop: MOBILE_HEADER_HEIGHT}}
                >
                    <div
                        style={{
                            height: `calc(100vh - ${MOBILE_HEADER_HEIGHT}px)`, display: 'flex', flexDirection: 'column',
                            background: C.ink, fontFamily: FONT,
                        }}
                    >
                        <div style={{padding: 16, flexShrink: 0}}>
                            <div style={{padding: 12, borderRadius: 16, border: `1px solid ${C.line}`, background: 'rgba(255,255,255,0.03)'}}>
                                <UserBlock name={displayName} role={userData.role} username={userData.username}/>
                            </div>
                        </div>

                        <div className="as-scroll" style={{flex: 1, overflowY: 'auto', overflowX: 'hidden'}}>
                            {menu((e) => {
                                handleItemClick(e);
                                setMobileMenuOpen(false);
                            })}
                        </div>

                        <div style={{padding: 16, flexShrink: 0, borderTop: `1px solid ${C.line}`}}>
                            <LogoutButton onClick={handleLogoutClick}/>
                        </div>
                    </div>
                </Drawer>
            </ConfigProvider>
        );
    }

    /* ============================ Desktop =========================== */
    return (
        <ConfigProvider theme={menuTheme}>
            <style>{css}</style>

            <Sider
                className="as-sider"
                theme="dark"
                trigger={null}
                collapsible
                collapsed={collapsed}
                width={SIDEBAR_WIDTH}
                collapsedWidth={SIDEBAR_COLLAPSED_WIDTH}
                style={{
                    height: '100vh', position: 'sticky', top: 0, left: 0,
                    background: C.ink, borderRight: `1px solid ${C.line}`, fontFamily: FONT,
                }}
            >
                <div style={{display: 'flex', flexDirection: 'column', height: '100%'}}>
                    {/* Brand */}
                    <div
                        style={{
                            flexShrink: 0, height: 72, display: 'flex', alignItems: 'center', gap: 12,
                            padding: collapsed ? 0 : '0 24px', justifyContent: collapsed ? 'center' : 'flex-start',
                            borderBottom: `1px solid ${C.line}`,
                        }}
                    >
                        <BrandMark/>
                        {!collapsed && (
                            <span style={{color: C.text, fontSize: 16, fontWeight: 700, letterSpacing: '0.02em'}}>
                                DASHBOARD
                            </span>
                        )}
                    </div>

                    {/* Profile */}
                    <div style={{flexShrink: 0, padding: collapsed ? '16px 0' : 16}}>
                        <div
                            style={{
                                padding: collapsed ? 0 : 12, borderRadius: 16,
                                border: collapsed ? 'none' : `1px solid ${C.line}`,
                                background: collapsed ? 'transparent' : 'rgba(255,255,255,0.03)',
                            }}
                        >
                            <UserBlock
                                name={displayName}
                                role={userData.role}
                                username={userData.username}
                                compact={collapsed}
                            />
                        </div>
                    </div>

                    {/* Menu */}
                    <div className="as-scroll" style={{flex: 1, overflowY: 'auto', overflowX: 'hidden'}}>
                        {menu(handleItemClick)}
                    </div>

                    {/* Footer */}
                    <div style={{flexShrink: 0, padding: collapsed ? '16px 12px' : 16, borderTop: `1px solid ${C.line}`}}>
                        <LogoutButton onClick={handleLogoutClick} collapsed={collapsed}/>
                    </div>
                </div>
            </Sider>
        </ConfigProvider>
    );
};

export default AppSidebar;