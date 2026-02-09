import { Box } from '@mui/material';
import { Layout, theme } from 'antd';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import AppContent from './elements/antd/AppContent';
import AppFooter from './elements/antd/AppFooter';
import AppHeader from './elements/antd/AppHeader';
import AppSidebar from './elements/antd/AppSidebar';

import sweetalert from 'sweetalert2';
import persistMiddleware from '../../../service/zustand/middleware/persistMiddleware';
import { menuItemsUser } from './utilities/menuItems';


const { Sider, Content, Header, Footer } = Layout;

const FormMember = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { Logout, user, apartmentData } = persistMiddleware();
  

    const [collapsed, setCollapsed] = useState(false);
    const [openKeys, setOpenKeys] = useState([]);
    const { token: { colorBgContainer, borderRadiusLG } } = theme.useToken();
    const userId = user?.userPayLoad?.user?.id



    useEffect(() => {
        if (location.pathname === '/member') {
            navigate('/member/homepage');
        }
    }, [navigate, location.pathname]);

    const handleMenuClick = async (e) => {
        const key = e.key;
        
        // ตรวจสอบ logout ก่อน
        if (key === 'logout') {
            const confirm = await sweetalert.fire({ 
                title: 'ออกจากระบบ?', 
                showCancelButton: true,
                icon: "question"
            });
            if (confirm.isConfirmed) {
                Logout(userId);
                navigate('/auth/login'); // เปลี่ยนไปยังหน้า login
            }
            return; // ออกจาก function ทันทีหลังจาก logout
        }

        // ฟังก์ชันค้นหาเส้นทางจาก menuItems (เฉพาะเมื่อไม่ใช่ logout)
        const findPath = (items) => {
            for (const item of items) {
                if (item.key === key) return item.path;
                if (item.children) {
                    const found = findPath(item.children);
                    if (found) return found;
                }
            }
            return null;
        };

        const path = findPath(menuItemsUser);
        if (path) navigate(path);
    };

    const onOpenChange = (keys) => {
        const latest = keys[keys.length - 1];
        setOpenKeys(latest ? [latest] : []);
    };

    return (
        <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
            <Box sx={{ display: "flex", flexGrow: 1 }}>
                <Layout>
                    <AppSidebar
                        handleMenuClick={handleMenuClick}
                        collapsed={collapsed}
                        menuItems={menuItemsUser}
                        onOpenChange={onOpenChange}
                        openKeys={openKeys}
                        user={user}
                    />
                    <Layout>
                        <AppHeader setCollapsed={setCollapsed} collapsed={collapsed} colorBg={colorBgContainer} apartmentData={apartmentData} />
                        <AppContent colorBg={colorBgContainer} borderLG={borderRadiusLG} />
                        <AppFooter />
                    </Layout>
                </Layout>
            </Box>
        </Box>
    );
};

export default FormMember;
