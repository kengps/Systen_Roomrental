import React from "react";
import AppRoutes from "../../../../../routes/AppRoutes";


import { Layout, Breadcrumb } from 'antd';
import { Outlet } from "react-router-dom";
const { Content } = Layout;


function AppContent({
  colorBg,
  borderLG,
  children
}) {
  console.log(`⩇⩇:⩇⩇🚨  file: AppContent.jsx:14  children :`, children);


  return (
    <Content
      style={{
        padding: '0 28px',
      }}
    >
      <Breadcrumb
        style={{
          margin: '10px 0',
        }}
      >
        <Breadcrumb.Item>Home</Breadcrumb.Item>
        <Breadcrumb.Item>List</Breadcrumb.Item>
        <Breadcrumb.Item>App</Breadcrumb.Item>
      </Breadcrumb>
      <div
        style={{
          padding: 24,
          minHeight: "90%",
          background: colorBg,
          borderRadius: borderLG,
        }}
      >
        {/* {children} */}
        <Outlet />
      </div>
    </Content>
  );
}



export default AppContent;

