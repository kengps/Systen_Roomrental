import React from 'react'
import { Button, Layout, Menu, theme } from 'antd';
const { Header, Sider, Content } = Layout;

const AppHeader = () => {
    return (
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
    )
}

export default AppHeader