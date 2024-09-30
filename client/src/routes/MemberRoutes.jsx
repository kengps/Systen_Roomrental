import React from 'react'
import { storeAuth } from '../service/zustand/store/loginStore'
import { Navigate, Outlet, useNavigate } from 'react-router-dom'
import LoadingSpinner from '../components/LoadingSpinner/LoadingSpinner'
import persistMiddleware from '../service/zustand/middleware/persistMiddleware'




const MemberRoutes = ({ isAuthenticated }) => {

    const { user } = persistMiddleware();
    console.log(`⩇⩇:⩇⩇🚨  file: MemberRoutes.jsx:13  user :`, user);


    return user && user.userPayLoad.user ? <Outlet /> : <LoadingSpinner />
    //return isAuthenticated ? <Outlet /> : <LoadingSpinner />
}

export default MemberRoutes