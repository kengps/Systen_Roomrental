// import React from 'react'
// import { storeAuth } from '../service/zustand/store/loginStore'
// import { Navigate, Outlet, useNavigate } from 'react-router-dom'
// import LoadingSpinner from '../components/LoadingSpinner/LoadingSpinner'
// import persistMiddleware from '../service/zustand/middleware/persistMiddleware'




// const MemberRoutes = ({ isAuthenticated }) => {

//     const { user } = persistMiddleware();



//     return user && user.userPayLoad.user ? <Outlet /> : <LoadingSpinner />
//     //return isAuthenticated ? <Outlet /> : <LoadingSpinner />
// }

// export default MemberRoutes

import React, { useEffect, useState } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import persistMiddleware from '../service/zustand/middleware/persistMiddleware';
import LoadingSpinner from '../components/LoadingSpinner/LoadingSpinner';
import { currentUser } from '../service/api/login_register'; // คุณต้องมี endpoint นี้

const MemberRoutes = () => {
    const { user, clearLocalStorage } = persistMiddleware();


    const navigate = useNavigate();
    const [ok, setOk] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkUser = async () => {
            if (user && user.token) {
                try {
                    await currentUser(user.token);
                    setOk(true);
                } catch (err) {
                    clearLocalStorage()
                    navigate('/auth/login');
                } finally {
                    setLoading(false);
                }
            } else {
                navigate('/auth/login');
            }
        };
        checkUser();
    }, [user, navigate]);

    if (loading) return <LoadingSpinner />;
    return ok ? <Outlet /> : <LoadingSpinner />;
};

export default MemberRoutes;
