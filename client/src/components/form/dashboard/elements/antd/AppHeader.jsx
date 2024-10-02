import React, { useState } from "react";
import { Button, Layout, Typography } from 'antd';
const { Header, } = Layout;

import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from '@ant-design/icons';


function AppHeader({
  setCollapsed,
  collapsed,
  colorBg
}) {

  return (
    <Header
      style={{
        padding: 0,
        background: colorBg,
      }}
    >
      <Typography
        className="Typography1"
        // variant="h4"
        style={{
          position: "absolute",
          left: "50%",
          // transform: "translateX(-50%)",
          justifyContent: 'center'
        }}
      >
        AdminPages
      </Typography>
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
  );
}

export default AppHeader;
