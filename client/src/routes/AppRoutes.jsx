import React, { Suspense, useEffect } from 'react'
import { Navigate, Route, Routes } from "react-router-dom";
import HomePage from '../pages/HomePage';
import IndexLogin from '../pages/login/Index';
import { storeAuth } from '../service/zustand/store/loginStore';

import AdminPages from '../pages/admin/Admin';
import MemberPage from '../pages/member/Member';
import PageNotFound from '../pages/404/PageNotFound';

import ProtectedRoutes from './ProtectedRoutes';

import AdminRoutes from './AdminRoutes';
import MemberRoutes from './MemberRoutes';

import persistMiddleware from '../service/zustand/middleware/persistMiddleware';
import TableAdmin from '../pages/admin/Table';
import routes from '../routes';



const AppRoutes = () => {

    //ทำการตรวจสอบการ login ถ้า login แล้ว รีเฟรชหน้าจะไม่หาย

    // persist store
    // const userAuth = persistMiddleware((state) => state.user);

    const { user, isAuthenticated } = persistMiddleware();
    console.log(`⩇⩇:⩇⩇🚨  file: AppRoutes.jsx:25  isAuthenticated :`, isAuthenticated);

    if (isAuthenticated) {
        console.log('ล็อคอินแล้ว อยู่ที่นี่แหละ');

    } else {
        console.log('ไปล็อคอินก่อน');

    }


    // const idToken = localStorage.token;  //token คือชื่อที่เราตั้ง


    // useEffect(() => {
    //     fetchUserInfo(idToken);
    // }, [])

    return (
        // <Routes>

        //     <Route path='/login' element={<IndexLogin />} />

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
                {routes.map(() => ({}))}
            </Routes>

        </Suspense>
    )
}

export default AppRoutes