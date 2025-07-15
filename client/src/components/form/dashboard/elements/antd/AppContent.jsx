import React from "react";
import { Layout, Breadcrumb } from 'antd';
import { Link, useLocation, Outlet } from "react-router-dom";
import { HomeOutlined } from '@ant-design/icons';

const { Content } = Layout;

function AppContent({ colorBg, borderLG }) {
  const location = useLocation();

  const getBreadcrumbItems = () => {
    const { pathname } = location;
    const segments = pathname.split('/').filter(Boolean);

    let url = '';
    const items = [];

    // ✅ เพิ่มหน้าแรกเป็นไอคอน
    items.push({
      title: (
        <Link to="/admin/dashboard">
          <HomeOutlined />
        </Link>
      ),
    });

    segments.forEach((segment, i) => {
      url += `/${segment}`;
      const isLast = i === segments.length - 1;

      const title = segment.charAt(0).toUpperCase() + segment.slice(1);

      if (isLast) {
        // ตัวสุดท้าย: หน้าปัจจุบัน
        items.push({ title: <span style={{ fontWeight: 'bold' }}>{title}</span> });
      } else if (i === 0) {
        // ✅ อันแรกหลังบ้าน: static (ไม่เป็นลิงก์)
        items.push({
          title: <span>{title}</span>,
        });
      } else {
        // อื่น ๆ ระหว่างกลาง: ทำเป็นลิงก์ได้ตามปกติ
        items.push({
          title: <Link to={url}>{title}</Link>,
        });
      }
    });


    return items;
  };

  return (
    <Content style={{ padding: '0 28px', margin: '20px 0 10px 0' }}>
      <Breadcrumb items={getBreadcrumbItems()} />
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
