import React from "react";
import { Box, Typography, Toolbar } from "@mui/material";
import AppRoutes from "../../../../../routes/AppRoutes";

import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UploadOutlined,
  UserOutlined,
  VideoCameraOutlined,
} from '@ant-design/icons';
import { Button, Layout, Menu, theme } from 'antd';
const { Header, Sider, Content } = Layout;


function AppContent() {

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();
  
  return (
    // <Box
    //   // component="main"
    //   // sx={{ flexGrow: 1, bgcolor: "background.default", p: 3 }}
    // >
    //   {/* <Toolbar /> */}

    //   <Box sx={{ height: "500px" }}>
    //     {/* Content goes here */}
    //     <AppRoutes />
    //   </Box>
    // </Box>
    <Content
      style={{
        margin: '24px 16px',
        padding: 24,
        minHeight: 280,
        background: colorBgContainer,
        borderRadius: borderRadiusLG,
      }}
    >
      <AppRoutes />
    </Content>
  );
}

export default AppContent;
