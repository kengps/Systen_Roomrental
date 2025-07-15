import { Avatar, Button, Layout, Space, Tooltip, Typography } from 'antd';
const { Header, } = Layout;

import {
  BellOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined
} from '@ant-design/icons';

function AppHeader({
  setCollapsed,
  collapsed,
  colorBg,
  apartmentData

}) {
 




  return (
    <Header
      style={{
        padding: 0,
        background: "linear-gradient(90deg, #003366, #0055a5)", // Header gradient
        display: "flex",
        alignItems: "center",
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)"
      }}
    >
      <Button
        type="text"
        icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        onClick={() => setCollapsed(!collapsed)}
        style={{
          fontSize: '18px',
          width: 64,
          height: 64,
          color: "#fff"
        }}
      />
      <Typography.Title
        level={4}
        style={{
          flexGrow: 1,
          textAlign: "center",
          margin: 0,
          fontWeight: 600,
          color: "#fff",
          letterSpacing: "0.5px",
          textShadow: "1px 1px 3px rgba(0,0,0,0.3)"
        }}
      >
        {apartmentData?.result?.apartmentName ?? "Room Rental By Prasert"}
      </Typography.Title>

      <Space size="middle">
        <Tooltip title="Notifications">
          <BellOutlined style={{ fontSize: "18px", color: "#fff", cursor: "pointer" }} />
        </Tooltip>
        <Avatar
          style={{
            backgroundColor: "#1890ff",
            verticalAlign: 'middle',
            cursor: "pointer",
          }}
          icon={<UserOutlined />}
        />
      </Space>

      <div style={{ width: 64 }} />
    </Header>

  );
}

export default AppHeader;