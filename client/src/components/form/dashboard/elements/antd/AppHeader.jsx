// import React from 'react';
// import { Avatar, Button, Layout, Space, Tooltip, Typography, Badge } from 'antd';
// const { Header } = Layout;
//
// import {
//   BellOutlined,
//   MenuFoldOutlined,
//   MenuUnfoldOutlined,
//   UserOutlined
// } from '@ant-design/icons';
// import NotificationPopover, { useNotificationCount } from '../../utilities/NotificationPopover';
//
//
//
// function AppHeader({
//   setCollapsed,
//   collapsed,
//   colorBg,
//   apartmentData,
//   onNotificationClick,
//   onUserClick
// }) {
//
//
//   // Get unread notification count
//   const unreadCount = useNotificationCount();
//
//
//
//   const handleNotificationClick = (notification) => {
//
//
//     // Call parent callback if provided
//     if (onNotificationClick) {
//       onNotificationClick(notification);
//     }
//   };
//
//   const handleUserClick = () => {
//     console.log('User avatar clicked');
//
//     // Call parent callback if provided
//     if (onUserClick) {
//       onUserClick();
//     }
//   };
//
//   return (
//     <Header
//       style={{
//         padding: 0,
//         background: "linear-gradient(90deg, #003366, #0055a5)", // Header gradient
//         display: "flex",
//         alignItems: "center",
//         boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)"
//       }}
//     >
//       {/* Menu Toggle Button */}
//       <Button
//         type="text"
//         icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
//         onClick={() => setCollapsed(!collapsed)}
//         style={{
//           fontSize: '18px',
//           width: 64,
//           height: 64,
//           color: "#fff"
//         }}
//       />
//
//       {/* Title */}
//       <Typography.Title
//         level={4}
//         style={{
//           flexGrow: 1,
//           textAlign: "center",
//           margin: 0,
//           fontWeight: 600,
//           color: "#fff",
//           letterSpacing: "0.5px",
//           textShadow: "1px 1px 3px rgba(0,0,0,0.3)"
//         }}
//       >
//         {apartmentData?.result?.apartmentName ?? "Room Rental By Prasert"}
//       </Typography.Title>
//
//       {/* Right Side Actions */}
//       <Space size="middle" align="center" style={{ marginRight: '24px' }}>
//         {/* Notification Bell with Popover */}
//         <NotificationPopover
//           onNotificationClick={handleNotificationClick}
//           placement="bottomRight"
//         >
//           <Tooltip title="การแจ้งเตือน">
//             <Badge count={unreadCount} size="small">
//               <div
//                 style={{
//                   fontSize: "18px",
//                   color: "#fff",
//                   cursor: "pointer",
//                   display: "flex",
//                   alignItems: "center",
//                   justifyContent: "center",
//                   width: "32px",
//                   height: "32px",
//
//
//                 }}
//               >
//                 <BellOutlined />
//               </div>
//             </Badge>
//           </Tooltip>
//         </NotificationPopover>
//
//         {/* User Avatar */}
//         {/* <Tooltip title="โปรไฟล์ผู้ใช้" >
//           <Avatar
//             size={32}
//             style={{
//
//               cursor: "pointer"
//             }}
//
//             icon={<UserOutlined />}
//             onClick={handleUserClick}
//           />
//         </Tooltip> */}
//       </Space>
//     </Header>
//   );
// }
//
// export default AppHeader;
import React from 'react';
import {Avatar, Button, Layout, Space, Tooltip, Typography, Badge} from 'antd';
import {
    BellOutlined,
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    UserOutlined
} from '@ant-design/icons';
import NotificationPopover, {useNotificationCount} from '../../utilities/NotificationPopover';

const {Header} = Layout;

function AppHeader({
                       setCollapsed,
                       collapsed,
                       apartmentData,
                       onNotificationClick,
                       onUserClick
                   }) {

    const unreadCount = useNotificationCount();

    const handleNotificationClick = (notification) => {
        if (onNotificationClick) {
            onNotificationClick(notification);
        }
    };

    const handleUserClick = () => {
        if (onUserClick) {
            onUserClick();
        }
    };

    return (
        <Header
            style={{
                padding: '0 24px',
                /* ปรับพื้นหลังให้ดูมีมิติด้วยสีจางๆ */
                background: "linear-gradient(135deg, #ffffff 0%, #f9f8ff 100%)",
                backdropFilter: "blur(15px)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                height: '70px',
                /* เส้นล่างเปลี่ยนเป็นสีม่วงสด */
                borderBottom: "3px solid #9155FD",
                position: 'sticky',
                top: 0,
                zIndex: 1000,
                boxShadow: "0 8px 25px rgba(145, 85, 253, 0.1)"
            }}
        >
            {/* ฝั่งซ้าย: Toggle Button สีแน่นๆ */}
            <div style={{display: 'flex', alignItems: 'center', zIndex: 2}}>
                <Button
                    type="text"
                    icon={collapsed ? <MenuUnfoldOutlined/> : <MenuFoldOutlined/>}
                    onClick={() => setCollapsed(!collapsed)}
                    style={{
                        fontSize: '22px',
                        width: 48,
                        height: 48,
                        background: "linear-gradient(135deg, #9155FD 0%, #D333FF 100%)",
                        color: "#fff",
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '12px',
                        boxShadow: "0 4px 12px rgba(145, 85, 253, 0.4)",
                        border: 'none'
                    }}
                />
            </div>

            {/* ตรงกลาง: Title แบบ Gradient Text เข้มๆ */}
            <div style={{
                position: 'absolute',
                left: '50%',
                transform: 'translateX(-50%)',
                textAlign: 'center',
                zIndex: 1
            }}>
                <div style={{position: 'relative', padding: '0 10px'}}>
                    <Typography.Title
                        level={4}
                        style={{
                            margin: 0,
                            fontWeight: 900, // ปรับให้หนาแน่นขึ้น
                            /* ใส่ลูกเล่นสีที่ตัวอักษร */
                            background: 'linear-gradient(90deg, #6226ef 0%, #9155FD 50%, #d333ff 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            fontSize: '22px',
                            letterSpacing: "0.8px",
                            textTransform: 'uppercase'
                        }}
                    >
                        {apartmentData?.result?.apartmentName ?? "Room Rental By Prasert"}
                    </Typography.Title>
                    {/* เส้นใต้แบบ Neon ยาวขึ้นและหนาขึ้น */}
                    <div style={{
                        height: '4px',
                        width: '60px',
                        background: 'linear-gradient(90deg, #9155FD 0%, #FF00E4 100%)',
                        borderRadius: '10px',
                        margin: '4px auto 0',
                        boxShadow: '0 0 12px rgba(211, 51, 255, 0.6)'
                    }}></div>
                </div>
            </div>

            {/* ฝั่งขวา: Actions แบบ Vibrant */}
            <Space size="large" align="center" style={{zIndex: 2}}>
                <NotificationPopover
                    onNotificationClick={handleNotificationClick}
                    placement="bottomRight"
                >
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: "44px",
                            height: "44px",
                            borderRadius: "14px",
                            cursor: "pointer",
                            background: "#fff",
                            boxShadow: "0 4px 10px rgba(145, 85, 253, 0.15)",
                            transition: "all 0.3s ease",
                            border: '1px solid rgba(145, 85, 253, 0.1)'
                        }}
                        className="header-action-btn"
                    >
                        <Badge count={unreadCount} size="small"
                               style={{backgroundColor: '#FF4D4F', boxShadow: '0 0 10px rgba(255,77,79,0.5)'}}>
                            <BellOutlined style={{fontSize: "24px", color: "#9155FD"}}/>
                        </Badge>
                    </div>
                </NotificationPopover>

                {/* User Profile วงแหวนสีสด (Rainbow Glow) */}
                <div
                    onClick={handleUserClick}
                    style={{
                        cursor: 'pointer',
                        padding: '4px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #6226ef 0%, #9155FD 50%, #ff00e4 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 6px 15px rgba(145, 85, 253, 0.4)',
                        transition: 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                    <Avatar
                        size={38}
                        style={{
                            background: '#fff',
                            color: '#9155FD',
                            border: '2px solid #fff',
                            fontWeight: 'bold'
                        }}
                        icon={<UserOutlined/>}
                    />
                </div>
            </Space>

            <style>{`
                .header-action-btn:hover {
                    transform: translateY(-3px) rotate(5deg);
                    background: #9155FD !important;
                    box-shadow: 0 8px 20px rgba(145, 85, 253, 0.3) !important;
                }
                .header-action-btn:hover .anticon {
                    color: #fff !important;
                }
            `}</style>
        </Header>
    );
}

export default AppHeader;