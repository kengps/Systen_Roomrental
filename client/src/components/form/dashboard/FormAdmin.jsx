import React, { useState } from 'react';
import { Box, Toolbar } from "@mui/material";
import { Layout, Menu, Button, theme } from 'antd';
import { UploadOutlined, UserOutlined, VideoCameraOutlined, MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons';
import { Outlet, useNavigate } from 'react-router-dom';
import TableAdmin from '../../../pages/admin/Table';
import HomePage from '../../../pages/HomePage';

const { Sider, Content, Header ,Footer} = Layout;

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
                navigate('/admin/db/table'); // เปลี่ยนเส้นทางไปยัง TableAdmin
                break;
            case '2':
                navigate('/admin/db/home'); // เปลี่ยนเส้นทางไปยัง HomePage
                break;
            case '3':
                navigate('/admin/user'); // เปลี่ยนเส้นทางไปยัง User
                break;
            default:
                break;
        }
    };

    return (
        <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
            <Box sx={{ display: "flex", flexGrow: 1 }}>
                <Layout>
                    <Sider trigger={null} collapsible collapsed={collapsed}>
                        <Toolbar style={{ backgroundColor: 'gray' }} />
                        <Menu
                            theme="dark"
                            mode="inline"
                            defaultSelectedKeys={['1']}
                            onClick={handleMenuClick} // ใช้ฟังก์ชัน handleMenuClick
                            items={[
                                {
                                    key: '1',
                                    icon: <UserOutlined />,
                                    label: 'TableAdmin',
                                },
                                {
                                    key: '2',
                                    icon: <VideoCameraOutlined />,
                                    label: 'HomePage',
                                },
                                {
                                    key: '3',
                                    icon: <UploadOutlined />,
                                    label: 'User',
                                },
                            ]}
                        />
                    </Sider>
                    <Layout>
                        <Header
                            style={{
                                padding: 0,
                                background: colorBgContainer,
                            }}
                        >
                            <Button
                                type="text"
                                icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                                onClick={() => setCollapsed(!collapsed)}
                                style={{
                                    fontSize: '16px',
                                    width: 64,
                                    height: 64,
                                }}
                            />
                        </Header>
                        <Content
                            style={{
                                margin: '24px 16px',
                                padding: 24,
                                minHeight: 280,
                                background: colorBgContainer,
                                borderRadius: borderRadiusLG,
                            }}
                        >
                            <Outlet />
                        </Content>
                        <Footer
                            style={{
                                textAlign: 'center',
                            }}
                        >
                            Ant Design ©{new Date().getFullYear()} Created by Ant UED
                        </Footer>
                    </Layout>
                </Layout>
            </Box>
            {/* AppFooter component ที่คุณมี */}
        </Box>
    )
}

export default FormAdmin;
