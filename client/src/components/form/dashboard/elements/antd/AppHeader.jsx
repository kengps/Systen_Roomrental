import React, { useState } from "react";
import { AppBar, Toolbar, Typography } from "@mui/material";

const drawerWidth = 240;

import { Button, Layout, Menu, theme } from 'antd';
const { Header, Sider, Content } = Layout;

import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UploadOutlined,
  UserOutlined,
  VideoCameraOutlined,
} from '@ant-design/icons';
function AppHeader({
  setCollapsed,
  collapsed
}) {


 
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();
  
  return (
    <>
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
    </>
  );
}

export default AppHeader;
