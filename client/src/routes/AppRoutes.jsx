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
import IndexForm from '../pages/login/Index';

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
        //     {/* ProtectedRoutes will cover both AdminRoutes and MemberRoutes */}
        //     <Route element={<ProtectedRoutes isAuthenticated={isAuthenticated} />}>

        //         {/* Admin routes protected by both ProtectedRoutes and AdminRoutes */}
        //         <Route path="/admin" element={<AdminRoutes />}>
        //             <Route path="db" element={<AdminPages />}>
        //                 <Route path="table" element={<TableAdmin />} />
        //                 <Route path="home" element={<HomePage />} />
        //             </Route>
        //         </Route>

        //         {/* Member routes protected by both ProtectedRoutes and MemberRoutes */}
        //         <Route path='/member' element={<MemberRoutes />}>
        //             <Route path='homepage' element={<MemberPage />} />
        //         </Route>

        //         <Route path='404' element={<PageNotFound />} />
        //     </Route>

        //     {/* Catch-all route for non-existent pages */}
        //     <Route path='*' element={<Navigate to='/404' replace />} />
        // </Routes>



        // <Routes>
        //     {/* Protected routes (for general users) */}

        //     <Route path='/auth/login' element={<IndexForm />} />

        //     <Route element={<ProtectedRoutes isAuthenticated={isAuthenticated} />}>
        //         {/* <Route path='/' element={<HomePage />} /> */}
        //         <Route path='404' element={<PageNotFound />} />
        //     </Route>

        //     {/* Admin routes */}
        //     <Route path="/admin" element={<AdminRoutes />}>
        //         {/* If user navigates to /admin without any specific route, redirect to /admin/db */}
        //         <Route index element={<Navigate to="/admin/dashboard" replace />} />

        //         {/* Admin dashboard pages */}
        //         <Route path="dashboard" element={<AdminPages />}>
        //             <Route path="table" element={<TableAdmin />} />
        //             <Route path="home" element={<HomePage />} />
        //         </Route>

        //         {/* Redirect to 404 if accessing unknown routes under /admin */}
        //         <Route path="*" element={<Navigate to="/404" replace />} />
        //     </Route>

        //     {/* Member routes */}
        //     <Route path='/member' element={<MemberRoutes />}>
        //         <Route path='homepage' element={<MemberPage />} />
        //         <Route path="home" element={<HomePage />} />
        //     </Route>

        //     {/* Catch-all route for unknown paths */}
        //     <Route path='*' element={<Navigate to='/404' replace />} />
        // </Routes>

        <Suspense fallback={<div>Loading...</div>}>
            <Routes>
                {routes.map((route, index) => {
                    if (route.children) {
                        return (
                            <Route key={index} path={route.path} element={<route.element />}>
                                {route.children.map((childRoute, childIndex) => {
                                    console.log(`⩇⩇:⩇⩇🚨  file: AppRoutes.jsx:103  childRoute :`, childRoute.element);

                                    if (childRoute.index) {
                                        return (
                                            <Route key={childIndex} index element={<Navigate to={'/admin/dashboard'} />} /> // Handle index route
                                        );
                                    }

                                    if (childRoute.children) {
                                        return (
                                            <Route key={childIndex} path={childRoute.path} element={<childRoute.element />}>
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
                                    return (
                                        <Route key={childIndex} path={childRoute.path} element={<childRoute.element />} />
                                    );
                                })}
                            </Route>
                        );
                    }
                    return (
                        <Route key={index} path={route.path} element={<route.element />} />
                    );
                })}
            </Routes>
         </Suspense>

    )
}

export default AppRoutes