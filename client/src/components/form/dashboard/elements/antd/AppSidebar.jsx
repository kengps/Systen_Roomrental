import React from 'react';
import { UploadOutlined, UserOutlined, VideoCameraOutlined, MailOutlined } from '@ant-design/icons';
import { Layout, Menu } from 'antd';
import { Toolbar } from '@mui/material';
import { useNavigate } from 'react-router-dom';  // ใช้ useNavigate เพื่อทำการนำทาง

const { Sider } = Layout;

const { SubMenu } = Menu;
const AppSidebar = ({ collapsed, handleMenuClick }) => {
  const navigate = useNavigate();  // ใช้ useNavigate


  return (
    <Sider trigger={null} collapsible collapsed={collapsed}>
      <Toolbar style={{ backgroundColor: 'gray' }} />
      <Menu
        theme="dark"
        mode="inline"
        defaultSelectedKeys={['1']}
        onClick={handleMenuClick} // ใช้ฟังก์ชัน handleMenuClick
        items={[
          
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
                  {
                    key: '1',
                    label: 'Table',
                  },
                  {
                    key: '2',
                    label: 'HomePage',
                  },
                  {
                    key: '3',
                    label: 'MainPage',
                  },
                  {
                    key: '4',
                    label: 'Option 4',
                  },
                ],
              },
            ],
          },
          {
            key: 'grp',
            label: 'กลุ่ม',
            type: 'group',
          }
        ]}
      />
    </Sider>
  );
};

export default AppSidebar;
