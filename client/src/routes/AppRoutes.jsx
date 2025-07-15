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


    return (

        <Suspense fallback={<div>Loading...</div>}>
            <Routes>
                {routes.map((route, index) => {
                    if (route.children) {
                        return (
                            <Route key={index} path={route.path} element={<route.element />}>
                                {route.children.map((childRoute, childIndex) => {


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