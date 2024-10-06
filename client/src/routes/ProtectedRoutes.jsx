// src/routes/ProtectedRoutes.js
import React, { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import persistMiddleware from '../service/zustand/middleware/persistMiddleware';
import axios from 'axios';
import { currentAdminRoute } from '../service/api/login_register';


const ProtectedRoutes = ({ children, roleRequired, routeType }) => {


    const [authorized, setAuthorized] = useState(null);


    useEffect(() => {
        const checkAuth = async () => {
            try {
                const token = localStorage.getItem('token');

                const res = await currentAdminRoute(token, routeType)
                console.log(`⩇⩇:⩇⩇🚨  file: ProtectedRoutes.jsx:20  res :`, res);

                if (roleRequired === res.data.role) {
                    setAuthorized(true);
                } else {
                    setAuthorized(false);
                }
            } catch (err) {
                setAuthorized(false);
            }
        };

        checkAuth();
    }, [roleRequired, routeType]);


    if (authorized === null) {
        return <div>Loading...</div>;
    }
    return authorized ? <Outlet /> : <Navigate to="/login" />;
};

export default ProtectedRoutes;