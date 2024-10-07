import React, { useEffect, useState } from 'react';
import { Box, Toolbar } from "@mui/material";
import { Layout, theme } from 'antd';
import { useLocation, useNavigate } from 'react-router-dom';


import AppHeader from './elements/antd/AppHeader';
import AppContent from './elements/antd/AppContent';
import AppFooter from './elements/antd/AppFooter';
import AppSidebar from './elements/antd/AppSidebar';
import routes from '../../../routes';
import persistMiddleware from '../../../service/zustand/middleware/persistMiddleware';
import menuItems from './utilities/menuItems';
import sweetalert from 'sweetalert2'

const { Sider, Content, Header, Footer } = Layout;

const FormAdmin = () => {

    const navigate = useNavigate(); // ใช้ useNavigate เพื่อเปลี่ยนเส้นทาง
    const location = useLocation();
    const { Logout,user } = persistMiddleware()

    // ตรวจสอบและนำทางไปยัง /admin/home เมื่ออยู่ที่ /admin
    useEffect(() => {
        if (location.pathname === '/admin') {
            navigate('/admin/dashboard'); // เปลี่ยนไปยังหน้า Home
        }
    }, [navigate, location.pathname]);



    const [collapsed, setCollapsed] = useState(false);
    const [openKeys, setOpenKeys] = useState([]); // Initial open key for submenu

    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();


    const handleMenuClick = async (e) => {
        try {
            // หาเมนูที่ถูกคลิก
            const key = e.key;
            if (key === 'logout') {
                const confirm = await sweetalert.fire({
                    title: 'ต้องการออกจากระบบ',
                    showCloseButton: true,
                    showCancelButton: true,
                    icon: "question"
                });
                if (confirm.isConfirmed) {
                    Logout();

                }

            }
            // ฟังก์ชันค้นหาเส้นทางจาก menuItems
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
                console.log(`⩇⩇:⩇⩇🚨  file: FormAdmin.jsx:73  path :`, path);

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
        <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
            <Box sx={{ display: "flex", flexGrow: 1 }}>
                <Layout>
                    <AppSidebar handleMenuClick={handleMenuClick} collapsed={collapsed} menuItems={menuItems} onOpenChange={onOpenChange} openKeys={openKeys}  user={user}/>
                    <Layout>
                        <AppHeader setCollapsed={setCollapsed} collapsed={collapsed} colorBg={colorBgContainer} />

                        <AppContent colorBg={colorBgContainer} borderLG={borderRadiusLG} routes={routes} />

                        <AppFooter />

                    </Layout>
                </Layout>
            </Box>
            {/* AppFooter component ที่คุณมี */}
        </Box>
    )
}

export default FormAdmin;
