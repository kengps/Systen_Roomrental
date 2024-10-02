import React from 'react';
import { UploadOutlined, UserOutlined, VideoCameraOutlined } from '@ant-design/icons';
import { Layout, Menu } from 'antd';
import { Toolbar } from '@mui/material';
import { useNavigate } from 'react-router-dom';  // ใช้ useNavigate เพื่อทำการนำทาง

const { Sider } = Layout;

const AppSidebar = ({ collapsed }) => {
  const navigate = useNavigate();  // ใช้ useNavigate

  const handleMenuClick = (e) => {
    if (e.key === '1') {
      navigate('/admin/table');  // นำทางไปที่ admin/table เมื่อคลิก nav 1
    }
    // สามารถเพิ่มการจัดการเมนูอื่นๆ ที่นี่ได้
  };

  return (
    <Sider trigger={null} collapsible collapsed={collapsed}>
      <Toolbar style={{ backgroundColor: 'gray' }} />
      <div className="demo-logo-vertical" />
      <Menu
        theme="dark"
        mode="inline"
        defaultSelectedKeys={['1']}
        onClick={handleMenuClick}  // จัดการคลิกเมนู
        items={[
          {
            key: '1',
            icon: <UserOutlined />,
            label: 'nav 1',  // นำทางไป /admin/table
          },
          {
            key: '2',
            icon: <VideoCameraOutlined />,
            label: 'nav 2',
          },
          {
            key: '3',
            icon: <UploadOutlined />,
            label: 'nav 3',
          },
        ]}
      />
    </Sider>
  );
};

export default AppSidebar;
