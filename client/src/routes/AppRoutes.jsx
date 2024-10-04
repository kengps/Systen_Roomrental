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

        <Suspense fallback={<Spin />}>
            <Routes>
<<<<<<< HEAD
  //* map routes
                {routes.map((route, index) => {

                    //1 //* ตรวจสอบว่ามี children หรือไม่ ถ้ามี จะสร้าง Route ที่มี children ซ้อนอยู่
                    if (route.children) {
                        return (
                            //3 //* สร้าง Route ที่มี children ซ้อนอยู่
                            <Route key={route.path} path={route.path} element={<route.element />} >

          //4 //* ทำการ map children routes และตรวจสอบว่ามี children ซ้อนอยู่หรือไม่
                                {route.children.map((childrenRoute, index) => {

                                    //5 //! ตรวจสอบว่ามี children ใน childrenRoute หรือไม่ ถ้ามี สร้าง nested route อีกชั้น
                                    if (childrenRoute.children) {
                                        return (
                                            //7 //* ถ้ามี children ใน childrenRoute ให้สร้าง nested Route ซ้อนอีกชั้น
                                            <Route key={childrenRoute.path} path={childrenRoute.path} element={<childrenRoute.element />} >

                                         // 8 //* ทำการ map childrenRoute children เพื่อดูว่ามี children ซ้อนอีกหรือไม่
                                                {childrenRoute.children.map((grandChildRoute, index) => {

                                                    //! ตรงนี้ถ้ามี children ใน grandChildRoute ให้ if else ปกติ แต่ถ้าไม่มีแล้ว ให้ส่งค่า (Route) เลยก็ได้ ไม่ต้อง return
                                                    return (
                                                        <Route key={grandChildRoute.path} path={grandChildRoute.path} element={<grandChildRoute.element />} />
                                                    )
                                                })}
                                            </Route>
                                        )
                                    }

                                    //6 // ถ้าไม่มี children ให้สร้าง Route ปกติ
                                    return (
                                        <Route key={childrenRoute.path} path={childrenRoute.path} element={<childrenRoute.element />} />
                                    )
                                })}
                            </Route>
                        )
                    }

                    //2 // ถ้าไม่มี children ให้สร้าง Route ปกติ
                    return (
                        <Route key={route.path} path={route.path} element={<route.element />} />
                    )
                })}
=======
                {routes.map(() => ({}))}
>>>>>>> origin/develop
            </Routes>

        </Suspense>
    )
}

export default AppRoutes