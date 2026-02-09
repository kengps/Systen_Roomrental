// import { LogoutOutlined, MenuOutlined, UserOutlined } from '@ant-design/icons';
// import { Box, Toolbar } from '@mui/material';
// import { Avatar, Button, Layout, Menu, Space, Typography } from 'antd';
// import React from 'react';
// import { useNavigate } from 'react-router-dom'; // ใช้ useNavigate เพื่อทำการนำทาง
// import { useMobile } from '../../../../../contexts/MobileContext';
// import './AppSidebar.css';
// const { Sider } = Layout;
// const { Title, Text } = Typography;
// const { SubMenu } = Menu;
// const AppSidebar = ({ collapsed, handleMenuClick, menuItems, onOpenChange, openKeys }) => {
//   const { isMobile, mobileMenuOpen, setMobileMenuOpen } = useMobile();
//
//   const navigate = useNavigate();  // ใช้ useNavigate
//
//   const store = JSON.parse(localStorage.getItem('auth-storage'))
//
//   let username = store ? store.state.user.userPayLoad.user.username : ""
//   let role = store ? store.state.user.userPayLoad.user.role : ""
//
//   // Handle logout button click
//   const handleLogoutClick = () => {
//     handleMenuClick({ key: 'logout' });
//   };
//
//
//   if (isMobile) {
//     return (
//       <>
//         {/* Modern Mobile Header */}
//         <Box sx={{
//           display: 'flex',
//           alignItems: 'center',
//           height: '70px',
//           padding: '0 20px',
//           background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
//           boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)',
//           position: 'relative',
//           overflow: 'hidden'
//         }}>
//           {/* Background Pattern */}
//           <Box sx={{
//             position: 'absolute',
//             top: 0,
//             left: 0,
//             right: 0,
//             bottom: 0,
//             background: `
//               radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%),
//               radial-gradient(circle at 80% 20%, rgba(255,255,255,0.05) 0%, transparent 50%),
//               radial-gradient(circle at 40% 80%, rgba(255,255,255,0.08) 0%, transparent 50%)
//             `,
//             pointerEvents: 'none'
//           }} />
//
//           {/* Mobile Profile Section */}
//           <Box sx={{
//             display: 'flex',
//             alignItems: 'center',
//             gap: '16px',
//             flex: 1,
//             zIndex: 2
//           }}>
//             <Box sx={{
//               position: 'relative',
//               '&::before': {
//                 content: '""',
//                 position: 'absolute',
//                 top: -2,
//                 left: -2,
//                 right: -2,
//                 bottom: -2,
//                 background: 'linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4)',
//                 borderRadius: '50%',
//                 zIndex: -1,
//                 animation: 'rotate 3s linear infinite'
//               }
//             }}>
//               <Avatar
//                 size="large"
//                 icon={<UserOutlined />}
//                 style={{
//                   background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
//                   border: '3px solid rgba(255,255,255,0.9)',
//                   boxShadow: '0 8px 25px rgba(102, 126, 234, 0.4)',
//                   width: '48px',
//                   height: '48px'
//                 }}
//               />
//             </Box>
//
//             <Box sx={{ color: 'white', minWidth: 0 }}>
//               <Typography.Text
//                 style={{
//                   color: 'white',
//                   fontSize: '16px',
//                   fontWeight: 600,
//                   display: 'block',
//                   overflow: 'hidden',
//                   textOverflow: 'ellipsis',
//                   whiteSpace: 'nowrap',
//                   textShadow: '0 2px 4px rgba(0,0,0,0.3)'
//                 }}
//               >
//                 {username.split('@')[0]}
//               </Typography.Text>
//               <Typography.Text
//                 style={{
//                   color: 'rgba(255,255,255,0.9)',
//                   fontSize: '12px',
//                   display: 'block',
//                   fontWeight: 500,
//                   textShadow: '0 1px 2px rgba(0,0,0,0.3)'
//                 }}
//               >
//                 {role}
//               </Typography.Text>
//             </Box>
//           </Box>
//
//           {/* Mobile Action Buttons */}
//           <Box sx={{ display: 'flex', gap: '12px', zIndex: 2 }}>
//             {/* Menu Toggle Button */}
//             <Button
//               type="text"
//               icon={<MenuOutlined />}
//               onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
//               style={{
//                 color: 'white',
//                 background: mobileMenuOpen ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.1)',
//                 border: '1px solid rgba(255,255,255,0.3)',
//                 borderRadius: '12px',
//                 height: '44px',
//                 width: '44px',
//                 display: 'flex',
//                 alignItems: 'center',
//                 justifyContent: 'center',
//                 backdropFilter: 'blur(10px)',
//                 boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
//                 transition: 'all 0.3s ease'
//               }}
//             />
//
//             {/* Logout Button */}
//             <Button
//               type="text"
//               icon={<LogoutOutlined />}
//               onClick={handleLogoutClick}
//               style={{
//                 color: 'white',
//                 background: 'rgba(255,107,107,0.2)',
//                 border: '1px solid rgba(255,107,107,0.4)',
//                 borderRadius: '12px',
//                 height: '44px',
//                 width: '44px',
//                 display: 'flex',
//                 alignItems: 'center',
//                 justifyContent: 'center',
//                 backdropFilter: 'blur(10px)',
//                 boxShadow: '0 4px 15px rgba(255,107,107,0.2)',
//                 transition: 'all 0.3s ease'
//               }}
//             />
//           </Box>
//         </Box>
//
//         {/* Modern Mobile Menu Dropdown */}
//         {mobileMenuOpen && (
//           <Box
//             className="mobile-menu-dropdown"
//             sx={{
//               position: 'fixed',
//               top: '70px',
//               left: 0,
//               right: 0,
//               background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.95) 0%, rgba(118, 75, 162, 0.95) 50%, rgba(240, 147, 251, 0.95) 100%)',
//               backdropFilter: 'blur(20px)',
//               boxShadow: '0 20px 40px rgba(102, 126, 234, 0.3)',
//               zIndex: 999,
//               maxHeight: 'calc(100vh - 70px)',
//               overflow: 'auto',
//               borderTop: '1px solid rgba(255,255,255,0.2)',
//               animation: 'slideDown 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
//             }}
//           >
//             {/* Background Pattern */}
//             <Box sx={{
//               position: 'absolute',
//               top: 0,
//               left: 0,
//               right: 0,
//               bottom: 0,
//               background: `
//                 radial-gradient(circle at 30% 20%, rgba(255,255,255,0.1) 0%, transparent 50%),
//                 radial-gradient(circle at 70% 80%, rgba(255,255,255,0.05) 0%, transparent 50%),
//                 radial-gradient(circle at 50% 50%, rgba(255,255,255,0.08) 0%, transparent 50%)
//               `,
//               pointerEvents: 'none'
//             }} />
//
//             <Menu
//               theme="dark"
//               mode="inline"
//               onClick={handleMenuClick}
//               items={menuItems}
//               onOpenChange={onOpenChange}
//               openKeys={openKeys}
//               style={{
//                 background: 'transparent',
//                 border: 'none',
//                 padding: '24px 20px',
//                 position: 'relative',
//                 zIndex: 2
//               }}
//             />
//           </Box>
//         )}
//       </>
//     );
//   }
//
//   return (
//     <Sider trigger={null} collapsible collapsed={collapsed}  style={{ display: 'flex', flexDirection: 'column' }}>
//       <Toolbar
//         style={{ padding: '3px', height: '80px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
//       >
//         <Space direction="horizontal" size={16} align="center" className='profile'
//         >
//           <Avatar
//             className='profileAvatar'
//             shape="square"
//             size="large"
//
//             icon={<UserOutlined />}
//           />
//           {!collapsed && (
//             <Space direction="vertical" size={4} style={{ textAlign: 'left' }}>
//               <Text style={{ fontSize: '12px' }}>ชื่อ: {username.split('@')[0]}</Text>
//               <Text style={{ fontSize: '12px' }}>ระดับ: {role}</Text>
//             </Space>
//           )}
//         </Space>
//       </Toolbar>
//
//       <div style={{ flex: 1, overflow: 'auto' }}>
//         <Menu
//           theme="dark"
//           mode="inline"
//           defaultSelectedKeys={['1']}
//           onClick={handleMenuClick}
//           items={menuItems}
//           onOpenChange={onOpenChange}
//           openKeys={openKeys}
//
//         />
//       </div>
//
//       {/* Logout Button */}
//       <div style={{ padding: '16px', marginTop: 'auto' }}>
//         <Button
//           type="primary"
//           danger
//           icon={<LogoutOutlined />}
//           onClick={handleLogoutClick}
//           block
//           className="logout-button"
//           style={{
//             height: '48px',
//             borderRadius: '12px',
//             fontWeight: 500,
//             fontSize: '14px',
//             display: 'flex',
//             alignItems: 'center',
//             justifyContent: 'center',
//             gap: '8px'
//           }}
//         >
//           {!collapsed && 'ออกจากระบบ'}
//         </Button>
//       </div>
//     </Sider>
//   );
// };
//
// export default AppSidebar;


import {LogoutOutlined, MenuOutlined, UserOutlined} from '@ant-design/icons';
import {Box} from '@mui/material';
import {Avatar, Button, Layout, Menu, Space, Typography} from 'antd';
import React from 'react';
import {useNavigate} from 'react-router-dom';
import {useMobile} from '../../../../../contexts/MobileContext';

const {Sider} = Layout;
const {Text} = Typography;

const AppSidebar = ({collapsed, handleMenuClick, menuItems, onOpenChange, openKeys}) => {
    const {isMobile, mobileMenuOpen, setMobileMenuOpen} = useMobile();
    const navigate = useNavigate();

    const store = JSON.parse(localStorage.getItem('auth-storage'))
    let username = store ? store.state.user.userPayLoad.user.username : ""
    let role = store ? store.state.user.userPayLoad.user.role : ""

    const handleLogoutClick = () => {
        handleMenuClick({key: 'logout'});
    };

    const injectStyles = `
    .ant-layout-sider {
        background: #FFFFFF !important;
        box-shadow: 4px 0 10px rgba(0,0,0,0.02) !important;
    }

    /* หัวข้อหมวดหมู่ */
    .ant-menu-item-group-title {
        display: flex !important;
        align-items: center !important;
        color: #9155FD !important;
        font-size: 11px !important;
        font-weight: 700 !important;
        letter-spacing: 0.8px;
        padding: 28px 20px 10px 20px !important;
    }
    .ant-menu-item-group-title::after {
        content: "";
        flex: 1;
        height: 2px;
        background: linear-gradient(90deg, rgba(145, 85, 253, 0.3) 0%, transparent 100%);
        margin-left: 12px;
    }

    /* รายการเมนู */
    .ant-menu-item, .ant-menu-submenu-title {
        margin: 4px 12px !important;
        width: calc(100% - 24px) !important;
        border-radius: 12px !important;
        height: 44px !important;
        line-height: 44px !important;
        color: #5d596c !important;
        transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1) !important;
    }

    .ant-menu-item:hover, .ant-menu-submenu-title:hover {
        background: rgba(145, 85, 253, 0.08) !important;
        color: #9155FD !important;
        transform: translateX(4px);
    }

    /* Active State */
    .ant-menu-item-selected {
        background: linear-gradient(108deg, #9155FD 0%, #D333FF 100%) !important;
        box-shadow: 0px 4px 12px rgba(145, 85, 253, 0.4) !important;
        color: #fff !important;
    }
    .ant-menu-item-selected .anticon { color: #fff !important; }

    .menu-scroll::-webkit-scrollbar { width: 4px; }
    .menu-scroll::-webkit-scrollbar-thumb { background: rgba(145, 85, 253, 0.2); border-radius: 10px; }
    
    @keyframes rotateRing {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
  `;

    // --- Mobile Version ---
    if (isMobile) {
        return (
            <>
                <style>{`
                    ${injectStyles}
                    @keyframes slideIn {
                        from { opacity: 0; transform: translateY(-10px); }
                        to { opacity: 1; transform: translateY(0); }
                    }
                    @keyframes pulseGlow {
                        0% { box-shadow: 0 0 0 0 rgba(145, 85, 253, 0.4); }
                        70% { box-shadow: 0 0 0 10px rgba(145, 85, 253, 0); }
                        100% { box-shadow: 0 0 0 0 rgba(145, 85, 253, 0); }
                    }
                    .mobile-nav-active {
                        background: #fff !important;
                        color: #9155FD !important;
                        box-shadow: 0 4px 15px rgba(0,0,0,0.1) !important;
                    }
                `}</style>

                <Box sx={{
                    position: 'sticky',
                    top: 0,
                    zIndex: 1100,
                    padding: '12px 16px',
                    background: 'linear-gradient(135deg, #6226ef 0%, #9155FD 50%, #d333ff 100%)',
                    boxShadow: '0 4px 25px rgba(98, 38, 239, 0.35)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderBottomLeftRadius: '20px',
                    borderBottomRightRadius: '20px',
                }}>
                    {/* ส่วนโปรไฟล์ฝั่งซ้าย */}
                    <Box sx={{display: 'flex', alignItems: 'center', gap: '12px'}}>
                        <div style={{
                            padding: '2px',
                            background: 'rgba(255,255,255,0.3)',
                            borderRadius: '50%',
                            display: 'flex',
                            animation: 'pulseGlow 2s infinite'
                        }}>
                            <Avatar
                                size={45}
                                icon={<UserOutlined/>}
                                style={{
                                    background: '#fff',
                                    color: '#9155FD',
                                    fontWeight: 'bold'
                                }}
                            />
                        </div>
                        <Box sx={{color: '#fff'}}>
                            <Typography.Text strong style={{
                                color: '#fff',
                                fontSize: '16px',
                                display: 'block',
                                textShadow: '0 2px 4px rgba(0,0,0,0.2)'
                            }}>
                                {username.split('@')[0]}
                            </Typography.Text>
                            <Typography.Text style={{
                                color: 'rgba(255,255,255,0.8)',
                                fontSize: '11px',
                                textTransform: 'uppercase',
                                letterSpacing: '1px'
                            }}>
                                {role}
                            </Typography.Text>
                        </Box>
                    </Box>

                    {/* ปุ่ม Action ฝั่งขวา */}
                    <Space size={8}>
                        <Button
                            className={mobileMenuOpen ? "mobile-nav-active" : ""}
                            type="text"
                            icon={<MenuOutlined/>}
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            style={{
                                color: '#fff',
                                fontSize: '20px',
                                background: 'rgba(255,255,255,0.15)',
                                borderRadius: '12px',
                                width: '45px',
                                height: '45px',
                                border: '1px solid rgba(255,255,255,0.2)',
                                backdropFilter: 'blur(10px)',
                                transition: 'all 0.3s'
                            }}
                        />
                        <Button
                            type="text"
                            icon={<LogoutOutlined/>}
                            onClick={handleLogoutClick}
                            style={{
                                color: '#fff',
                                fontSize: '18px',
                                background: 'rgba(255,77,79,0.25)',
                                borderRadius: '12px',
                                width: '45px',
                                height: '45px',
                                border: '1px solid rgba(255,77,79,0.3)',
                                backdropFilter: 'blur(10px)'
                            }}
                        />
                    </Space>
                </Box>

                {/* Menu Dropdown แบบลอยตัว (Floating) */}
                {mobileMenuOpen && (
                    <Box sx={{
                        position: 'fixed',
                        top: '85px',
                        left: '16px',
                        right: '16px',
                        maxHeight: '75vh',
                        background: 'rgba(255, 255, 255, 0.95)',
                        backdropFilter: 'blur(20px)',
                        borderRadius: '24px',
                        zIndex: 1099,
                        overflowY: 'auto',
                        boxShadow: '0 20px 50px rgba(0,0,0,0.15)',
                        border: '1px solid rgba(255,255,255,0.5)',
                        animation: 'slideIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                        padding: '10px'
                    }}>
                        <Menu
                            mode="inline"
                            onClick={(e) => {
                                handleMenuClick(e);
                                setMobileMenuOpen(false);
                            }}
                            items={menuItems}
                            style={{
                                border: 'none',
                                background: 'transparent',
                            }}
                        />
                    </Box>
                )}
                {/* Backdrop สีจางๆ เมื่อเปิดเมนู */}
                {mobileMenuOpen && (
                    <Box
                        onClick={() => setMobileMenuOpen(false)}
                        sx={{
                            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                            background: 'rgba(0,0,0,0.1)', zIndex: 1098,
                            backdropFilter: 'blur(4px)'
                        }}
                    />
                )}
            </>
        );
    }

    // --- Desktop Version ---
    return (
        <Sider
            trigger={null}
            collapsible
            collapsed={collapsed}
            width={260}
            style={{
                height: '100vh', position: 'sticky', top: 0, left: 0,
                zIndex: 100, borderRight: '1px solid rgba(145, 85, 253, 0.1)'
            }}
        >
            <style>{injectStyles}</style>

            {/* Brand Section */}
            <div style={{padding: '30px 24px 20px 24px', display: 'flex', alignItems: 'center', gap: '12px'}}>
                <div style={{
                    width: '35px', height: '35px',
                    background: 'linear-gradient(135deg, #9155FD 0%, #D333FF 100%)',
                    borderRadius: '10px', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', color: 'white', fontWeight: 'bold',
                    boxShadow: '0 4px 12px rgba(145, 85, 253, 0.4)', fontSize: '18px'
                }}>G
                </div>
                {!collapsed && <Text style={{
                    fontSize: '20px',
                    fontWeight: 900,
                    color: '#3A3541',
                    letterSpacing: '0.5px'
                }}>DASHBOARD</Text>}
            </div>

            {/* User Info Card */}
            <div style={{padding: '10px 20px 25px 20px'}}>
                <div style={{
                    display: 'flex', alignItems: 'center', gap: '12px',
                    background: 'linear-gradient(145deg, rgba(145, 85, 253, 0.05), rgba(211, 51, 255, 0.05))',
                    padding: '16px', borderRadius: '16px',
                    border: '1px solid rgba(145, 85, 253, 0.1)',
                    justifyContent: collapsed ? 'center' : 'flex-start'
                }}>
                    <Avatar
                        size={collapsed ? 36 : 42}
                        icon={<UserOutlined/>}
                        style={{
                            background: 'linear-gradient(135deg, #9155FD, #6d32cb)',
                            boxShadow: '0 4px 8px rgba(145, 85, 253, 0.3)'
                        }}
                    />
                    {!collapsed && (
                        <div style={{overflow: 'hidden'}}>
                            <Text strong style={{
                                fontSize: '15px',
                                color: '#3A3541',
                                display: 'block'
                            }}>{username.split('@')[0]}</Text>
                            <Text style={{fontSize: '11px', color: '#9155FD', fontWeight: 600}}>{role}</Text>
                        </div>
                    )}
                </div>
            </div>

            {/* Menu Section */}
            <div className="menu-scroll" style={{flex: 1, overflowY: 'auto', overflowX: 'hidden'}}>
                <Menu
                    mode="inline"
                    onClick={handleMenuClick}
                    items={menuItems}
                    onOpenChange={onOpenChange}
                    openKeys={openKeys}
                    style={{border: 'none', background: 'transparent'}}
                />
            </div>

            {/* Logout Footer */}
            <div style={{padding: '20px'}}>
                <Button
                    type="text"
                    icon={<LogoutOutlined/>}
                    onClick={handleLogoutClick}
                    block
                    style={{
                        height: '48px', borderRadius: '12px', color: '#ff4d4f', fontWeight: 700,
                        display: 'flex', alignItems: 'center', background: 'rgba(255, 77, 79, 0.06)',
                        justifyContent: collapsed ? 'center' : 'flex-start', paddingLeft: collapsed ? '0' : '20px',
                        border: '1px solid rgba(255, 77, 79, 0.1)'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 77, 79, 0.12)';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 77, 79, 0.06)';
                        e.currentTarget.style.transform = 'translateY(0)';
                    }}
                >
                    {!collapsed && <span style={{marginLeft: '12px'}}>Sign Out</span>}
                </Button>
            </div>
        </Sider>
    );
};

export default AppSidebar;