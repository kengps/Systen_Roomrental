import React from 'react';
import { UploadOutlined, UserOutlined, VideoCameraOutlined, MailOutlined } from '@ant-design/icons';
import { Avatar, Space, Layout, Menu, Grid, Typography } from 'antd';
import { Toolbar } from '@mui/material';
import { useNavigate } from 'react-router-dom';  // ใช้ useNavigate เพื่อทำการนำทาง

const { Sider } = Layout;
const { Title, Text } = Typography;
const { SubMenu } = Menu;
const AppSidebar = ({ collapsed, handleMenuClick, menuItems, onOpenChange, openKeys, }) => {

  const navigate = useNavigate();  // ใช้ useNavigate

  const store = JSON.parse(localStorage.getItem('auth-storage'))

  let username = store ? store.state.user.userPayLoad.user.username : ""
  let role = store ? store.state.user.userPayLoad.user.role : ""


  return (
    <Sider trigger={null} collapsible collapsed={collapsed}>
      <Toolbar
        style={{ padding: '3px', height: '80px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
      >
        <Space direction="horizontal" size={16} align="center" className='profile'
        >
          <Avatar
            className='profileAvatar'
            shape="square"
            size="large"
            
            icon={<UserOutlined />}
          />
          {!collapsed && (
            <Space direction="vertical" size={4} style={{ textAlign: 'left' }}>
              <Text style={{ fontSize: '12px' }}>ชื่อ: {username.split('@')[0]}</Text>
              <Text style={{ fontSize: '12px' }}>ระดับ: {role}</Text>
            </Space>
          )}
        </Space>
      </Toolbar>

      <Menu
        theme="dark"
        mode="inline"
        defaultSelectedKeys={['1']}
        onClick={handleMenuClick}
        items={menuItems}
        onOpenChange={onOpenChange}
        openKeys={openKeys}
      />
    </Sider>
  );
};

export default AppSidebar;
