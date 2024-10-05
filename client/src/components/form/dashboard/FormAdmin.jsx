import React, { useEffect, useState } from 'react';
import { Box, Toolbar } from "@mui/material";
import { Layout, Menu, Button, theme } from 'antd';
import { UploadOutlined, UserOutlined, VideoCameraOutlined, MenuFoldOutlined, MenuUnfoldOutlined, MailOutlined } from '@ant-design/icons';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import TableAdmin from '../../../pages/admin/Table';
import HomePage from '../../../pages/HomePage';
import AppHeader from './elements/antd/AppHeader';
import AppContent from './elements/antd/AppContent';
import AppFooter from './elements/antd/AppFooter';
import AppSidebar from './elements/antd/AppSidebar';
import routes from '../../../routes';


const { Sider, Content, Header, Footer } = Layout;

const FormAdmin = () => {

    const navigate = useNavigate(); // ใช้ useNavigate เพื่อเปลี่ยนเส้นทาง
    const location = useLocation();


    // ตรวจสอบและนำทางไปยัง /admin/home เมื่ออยู่ที่ /admin
    useEffect(() => {
        if (location.pathname === '/admin') {
            navigate('/admin/dashboard'); // เปลี่ยนไปยังหน้า Home
        }
    }, [navigate, location.pathname]);



    const [collapsed, setCollapsed] = useState(false);
    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();




    const menuItems = [
        {
            key: '0',
            label: 'กลุ่ม',
            type: 'group',
            children: [
                {
                    key: 'sub1',
                    label: 'DashBroad',
                    icon: <MailOutlined />,
                    children: [
                        { key: '1', label: 'Table', path: '/admin/dashboard/table' },
                        { key: '2', label: 'HomePage', path: '/admin/dashboard/home' },
                        { key: '3', label: 'MainPage', path: '/admin/dashboard/mainpage' },
                        { key: '4', label: 'Option 4', path: '/admin/dashboard/option4' },
                    ],
                },
            ],
        },
        {
            key: 'sub2',
            label: 'ตั้งค่า',
            type: 'setting',
            children: [
                { key: '5', label: 'Table2', path: '/admin/setting/table' },
                { key: '6', label: 'HomePage2', path: '/admin/dashboard/homepage2' },
                { key: '7', label: 'MainPage2', path: '/admin/dashboard/mainpage2' },
                { key: '8', label: 'Option2', path: '/admin/dashboard/option2' },
            ],
        },
    ];


    const handleMenuClick = (e) => {
        // หาเมนูที่ถูกคลิก
        const key = e.key;

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
            navigate(path); // นำทางไปยังเส้นทางที่ค้นพบ
        }
    };


    return (
        <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
            <Box sx={{ display: "flex", flexGrow: 1 }}>
                <Layout>
                    <AppSidebar handleMenuClick={handleMenuClick} collapsed={collapsed} menuItems={menuItems} />
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
