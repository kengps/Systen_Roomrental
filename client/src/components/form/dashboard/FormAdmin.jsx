import {Box} from "@mui/material";
import {Layout, theme} from 'antd';
import React, {useEffect, useState} from 'react';
import {useLocation, useNavigate} from 'react-router-dom';
import {useMobile} from '../../../contexts/MobileContext';


import routes from '../../../routes';
import persistMiddleware from '../../../service/zustand/middleware/persistMiddleware';
import AppContent from './elements/antd/AppContent';
import AppFooter from './elements/antd/AppFooter';
import AppHeader from './elements/antd/AppHeader';
import AppSidebar from './elements/antd/AppSidebar';

import {toast} from 'react-toastify';
import sweetalert from 'sweetalert2';
import {menuItems} from './utilities/menuItems';

const {Sider, Content, Header, Footer} = Layout;

const FormAdmin = () => {
    const {isMobile, mobileMenuOpen, setMobileMenuOpen} = useMobile();

    const navigate = useNavigate(); // ใช้ useNavigate เพื่อเปลี่ยนเส้นทาง
    const location = useLocation();
    const {Logout, user, apartmentData} = persistMiddleware()


    // ตรวจสอบและนำทางไปยัง /admin/home เมื่ออยู่ที่ /admin
    useEffect(() => {
        if (location.pathname === '/admin') {
            navigate('/admin/dashboard'); // เปลี่ยนไปยังหน้า Home
        }
    }, [navigate, location.pathname]);

    const userId = user?.userPayLoad?.user?.id

    const [collapsed, setCollapsed] = useState(false);
    const [openKeys, setOpenKeys] = useState([]); // Initial open key for submenu

    const {
        token: {colorBgContainer, borderRadiusLG},
    } = theme.useToken();

    const handleMenuClick = async (e) => {
        try {
            // หาเมนูที่ถูกคลิก
            const key = e.key;

            // ปิด mobile menu เมื่อคลิกเมนู
            if (isMobile) {
                setMobileMenuOpen(false);
            }

            // ตรวจสอบ logout ก่อน
            if (key === 'logout') {
                const confirm = await sweetalert.fire({
                    title: 'ต้องการออกจากระบบ',
                    showCloseButton: true,
                    showCancelButton: true,
                    icon: "question"
                });
                if (confirm.isConfirmed) {
                    const userId = user?.userPayLoad?.user?.id

                    const res = await Logout(userId);

                    if (res.status === 201) {
                        toast.success('logout สำเร็จ')
                        navigate('/auth/login'); // เปลี่ยนไปยังหน้า Home
                    }
                }
                return; // ออกจาก function ทันทีหลังจาก logout
            }

            // ฟังก์ชันค้นหาเส้นทางจาก menuItems (เฉพาะเมื่อไม่ใช่ logout)
            const findPath = (items) => {
                for (const item of items) {
                    if (item.key === key) {
                        return item.path; // คืนค่าเส้นทางหากเจอ
                    }
                    if (item.children) {
                        const foundPath = findPath(item.children);
                        if (foundPath) return foundPath; // คืนค่าเส้นทางจาก children
                    }
                }
                return null; // หากไม่เจอ
            };
            const path = findPath(menuItems);
            if (path) {
                navigate(path); // นำทางไปยังเส้นทางที่ค้นพบ
            }
        } catch (error) {
            console.log(`⩇⩇:⩇⩇🚨  file: FormAdmin.jsx:133  error :`, error);
        }
    };

    // Only allow one submenu to be open at a time
    const onOpenChange = (keys) => {


        const latestOpenKey = keys[keys.length - 1]; // Find the last opened key

        setOpenKeys(latestOpenKey ? [latestOpenKey] : []); // Set only the latest key as open, closing others
    };

    return (
        <Box sx={{display: "flex", flexDirection: "column", minHeight: "100vh"}}>
            {isMobile ? (
                // Mobile Layout: Menu on top
                <Box sx={{display: "flex", flexDirection: "column", flexGrow: 1}}>
                    {/* Mobile Menu Bar */}
                    <Box sx={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        zIndex: 1000,
                        background: 'linear-gradient(135deg, #19478c 0%, #2a5a9c 100%)',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                    }}>
                        <AppSidebar
                            handleMenuClick={handleMenuClick}
                            collapsed={false}
                            menuItems={menuItems}
                            onOpenChange={onOpenChange}
                            openKeys={openKeys}
                            user={user}
                        />
                    </Box>

                    {/* Mobile Content */}
                    <Box sx={{
                        marginTop: '70px', // Space for fixed menu
                        flexGrow: 1,
                        minHeight: 'calc(100vh - 70px)'
                    }}>
                        <AppContent
                            colorBg={colorBgContainer}
                            borderLG={borderRadiusLG}
                            routes={routes}
                        />
                    </Box>

                    <AppFooter/>
                </Box>
            ) : (
                // Desktop Layout: Sidebar on left
                <Box sx={{display: "flex", flexGrow: 1}}>
                    <Layout>
                        <AppSidebar
                            handleMenuClick={handleMenuClick}
                            collapsed={collapsed}
                            menuItems={menuItems}
                            onOpenChange={onOpenChange}
                            openKeys={openKeys}
                            user={user}
                        />
                        <Layout>
                            <AppHeader
                                setCollapsed={setCollapsed}
                                collapsed={collapsed}
                                colorBg={colorBgContainer}
                                apartmentData={apartmentData}
                            />
                            <AppContent
                                colorBg={colorBgContainer}
                                borderLG={borderRadiusLG}
                                routes={routes}
                            />
                            <AppFooter/>
                        </Layout>
                    </Layout>
                </Box>
            )}
        </Box>
    )
}

export default FormAdmin;
