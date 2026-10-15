import React, {Suspense} from 'react';
import {Navigate, Route, Routes} from 'react-router-dom';
import {Skeleton} from 'antd';
import routes from '../routes';

const PageSkeleton = () => (
    <div style={{padding: 24}}>
        <Skeleton active title paragraph={{rows: 6}}/>
    </div>
);

// ครอบแต่ละหน้า (ระดับ child ลงไป) ด้วย Suspense ของตัวเอง
// → ตอนหน้าใหม่กำลังโหลด จะมี fallback แค่ในพื้นที่เนื้อหา (ตรง <Outlet />)
// ส่วน Layout / Sidebar ที่อยู่ด้านบนจะไม่ถูกแทนที่
const withBoundary = (Component) => (
    <Suspense fallback={<PageSkeleton/>}>
        <Component/>
    </Suspense>
);

const renderRoutes = (list, depth = 0) =>
    list.map((route, index) => {
        // index route ของ child → redirect เหมือนเดิม
        if (depth > 0 && route.index) {
            return <Route key={index} index element={<Navigate to="/admin/dashboard"/>}/>;
        }

        const element = depth === 0 ? <route.element/> : withBoundary(route.element);

        return (
            <Route key={index} path={route.path} element={element}>
                {route.children && renderRoutes(route.children, depth + 1)}
            </Route>
        );
    });

const AppRoutes = () => (
    // boundary ชั้นนอก: ใช้ตอนโหลด Layout ระดับบนสุดครั้งแรกเท่านั้น
    <Suspense fallback={<PageSkeleton/>}>
        <Routes>{renderRoutes(routes)}</Routes>
    </Suspense>
);

export default AppRoutes;