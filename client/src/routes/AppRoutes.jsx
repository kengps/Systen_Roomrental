import React, { Suspense, useEffect } from 'react'
import { Navigate, Route, Routes } from "react-router-dom";
import HomePage from '../pages/HomePage';
import AdminPages from '../pages/admin/Admin';
import MemberPage from '../pages/member/Member';
import PageNotFound from '../pages/404/PageNotFound';

import ProtectedRoutes from './ProtectedRoutes';

import AdminRoutes from './AdminRoutes';
import MemberRoutes from './MemberRoutes';

import persistMiddleware from '../service/zustand/middleware/persistMiddleware';
import TableAdmin from '../pages/admin/Table';
import routes from '../routes';

import { Spin } from 'antd';

const AppRoutes = () => {
    // persist store
    // const userAuth = persistMiddleware((state) => state.user);

    const { user, isAuthenticated } = persistMiddleware();
    if (isAuthenticated) {
    } else {
    }


    // const idToken = localStorage.token;  //token คือชื่อที่เราตั้ง


    // useEffect(() => {
    //     fetchUserInfo(idToken);
    // }, [])

    return (
        // <Routes>
        //     <Route element={<ProtectedRoutes isAuthenticated={isAuthenticated} />}>
        //         {/* <Route path='/' element={<HomePage />} /> */}
        //         <Route path='404' element={<PageNotFound />} />
        //     </Route>


        //     <Route path="/admin" element={<AdminRoutes />}> {/* ใช้ AdminRoutes เป็น wrapper */}
        //         <Route path="db" element={<AdminPages />}>
        //             <Route path="table" element={<TableAdmin />} />
        //             <Route path="home" element={<HomePage />} />
        //         </Route>
        //     </Route>

        //     {/* <Route path='/admin/homepage' element={<AdminPages />} /> */}
        //     <Route path='/member' element={<MemberRoutes />}>
        //         <Route path='homepage' element={<MemberPage />} />
        //     </Route>

        //     <Route path='*' element={<Navigate to='/404' replace />} />
        // </Routes>


        <Suspense fallback={<div>Loading</div>}>
            <Routes>
                {routes.map((route, index) => {
                    // //! ตรวจสอบว่า route มี children หรือไม่
                    if (route.children) {
                        // //* ถ้ามี children ให้สร้าง Route หลัก
                        return (
                            <Route key={index} path={route.path} element={<route.element />}>
                                {/* //TODO: ตรวจสอบ children และสร้าง Route สำหรับ children */}
                                {route.children.map((childRoute, childIndex) => {
                                    // //! ตรวจสอบว่า childRoute มี children หรือไม่
                                    if (childRoute.children) {
                                        // //* ถ้ามี children ให้สร้าง Route สำหรับ childRoute
                                        return (
                                            <Route key={childIndex} path={childRoute.path} element={<childRoute.element />}>
                                                {/* //TODO: ตรวจสอบ grandChildRoute และสร้าง Route สำหรับ grandChildRoute */}
                                                {childRoute.children.map((grandChildRoute, grandChildIndex) => (
                                                    <Route
                                                        key={grandChildIndex}
                                                        path={grandChildRoute.path}
                                                        element={<grandChildRoute.element />}
                                                    />
                                                ))}
                                            </Route>
                                        );
                                    }
                                    // //* ถ้าไม่มี children ให้สร้าง Route ปกติ
                                    return (
                                        <Route
                                            key={childIndex}
                                            path={childRoute.path}
                                            element={<childRoute.element />}
                                        />
                                    );
                                })}
                            </Route>
                        );
                    }
                    // //* ถ้าไม่มี children ให้สร้าง Route ปกติ
                    return (
                        <Route key={index} path={route.path} element={<route.element />} />
                    );
                })}
            </Routes>

        </Suspense>
    )
}

export default AppRoutes