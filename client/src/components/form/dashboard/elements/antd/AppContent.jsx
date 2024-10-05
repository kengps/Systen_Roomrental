import React from "react";
import { Layout, Breadcrumb } from 'antd';
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { HomeOutlined } from '@ant-design/icons';
const { Content } = Layout;

function AppContent({
  colorBg,
  borderLG,
}) {
  const location = useLocation();

  const Breadcrumbs = () => {
    const { pathname } = location;
    const segments = pathname.split('/').filter(Boolean); // แยก segments และกรองค่าว่าง

    let url = ''; // สำหรับสร้าง URL
    // กรอง "Admin" ออกจาก segments
    const filteredSegments = segments.filter(segment => segment !== 'admin');
    const breadcrumbLinks = segments.map((segment, i) => {
      url += `/${segment}`; // สร้าง URL ตาม segment

      return (
        <Breadcrumb.Item key={i}>
          {i === segments.length - 1 ? ( // เช็คว่าตอนนี้คือหน้าสุดท้ายหรือไม่
            <div style={{ fontWeight: 'bold' }}>
              {segment.charAt(0).toUpperCase() + segment.slice(1)}
            </div> // แสดงชื่อ segment โดยไม่ทำลิงก์
          ) : (
            <Link to={url}>
              {segment.charAt(0).toUpperCase() + segment.slice(1)} {/* Capitalize the first letter */}
            </Link>
          )}
        </Breadcrumb.Item>
      );
    });

    return breadcrumbLinks;
  };

  return (
    <Content
      style={{
        padding: '0 28px',
      }}
    >
      <Breadcrumb>
        <Breadcrumb.Item>
          <Link to="/admin/dashboard"><HomeOutlined /></Link>
        </Breadcrumb.Item>
        {Breadcrumbs()} {/* เรียกใช้ Breadcrumbs */}
      </Breadcrumb>

      <div
        style={{
          padding: 24,
          minHeight: "90%",
          background: colorBg,
          borderRadius: borderLG,
        }}
      >
        <Outlet />
      </div>
    </Content>
  );
}

export default AppContent;
