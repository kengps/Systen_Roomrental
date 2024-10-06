import React from 'react';
import { UploadOutlined, UserOutlined, VideoCameraOutlined, MailOutlined } from '@ant-design/icons';
import { Layout, Menu } from 'antd';
import { Toolbar } from '@mui/material';
import { useNavigate } from 'react-router-dom';  // ใช้ useNavigate เพื่อทำการนำทาง

const { Sider } = Layout;

const { SubMenu } = Menu;
const AppSidebar = ({ collapsed, handleMenuClick,menuItems ,onOpenChange ,openKeys,}) => {
  const navigate = useNavigate();  // ใช้ useNavigate


  return (
    <Sider trigger={null} collapsible collapsed={collapsed}>
      <Toolbar style={{ backgroundColor: 'gray' }} />

      <Menu
        theme="dark"
        mode="inline"
        defaultSelectedKeys={['1']}
        onClick={handleMenuClick}
        items={menuItems} // ใช้ menuItems ตรงนี้
        onOpenChange={onOpenChange} // Pass onOpenChange to handle submenu toggling
        openKeys={openKeys} // Control the state of open submenus
      />
    </Sider>
  );
};

export default AppSidebar;
