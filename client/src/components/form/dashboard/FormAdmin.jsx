import React, { useState } from 'react';
import { Box, Toolbar } from "@mui/material";
import { Layout, Menu, Button, theme } from 'antd';
import { UploadOutlined, UserOutlined, VideoCameraOutlined, MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons';
import { Outlet, useNavigate } from 'react-router-dom';
import TableAdmin from '../../../pages/admin/Table';
import HomePage from '../../../pages/HomePage';
import AppHeader from './elements/antd/AppHeader';
import AppContent from './elements/antd/AppContent';
import AppFooter from './elements/antd/AppFooter';
import AppSidebar from './elements/antd/AppSidebar';
import routes from '../../../routes';


const { Sider, Content, Header, Footer } = Layout;

const FormAdmin = () => {
    const [collapsed, setCollapsed] = useState(false);
    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();

    const navigate = useNavigate(); // ใช้ useNavigate เพื่อเปลี่ยนเส้นทาง

    // Function to handle menu click and navigate
    const handleMenuClick = (e) => {
        const key = e.key;
        switch (key) {
            case '1':
                navigate('/admin/dashboard/table'); // เปลี่ยนเส้นทางไปยัง TableAdmin
                break;
            case '2':
                navigate('/admin/dashboard/home'); // เปลี่ยนเส้นทางไปยัง HomePage
                break;
            case '3':
                navigate('/admin/dashboard/tableadmin'); // เปลี่ยนเส้นทางไปยัง User
                break;
            default:
                break;
        }
    };

    return (
        <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
            <Box sx={{ display: "flex", flexGrow: 1 }}>
                <Layout>
                    <AppSidebar handleMenuClick={handleMenuClick} collapsed={collapsed} />
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
