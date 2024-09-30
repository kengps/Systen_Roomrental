import React, { useEffect, useState } from 'react'
import { currentAdmin } from '../service/api/login_register'
import { storeAuth } from '../service/zustand/store/loginStore'
import LoadingSpinner from '../components/LoadingSpinner/LoadingSpinner';
import { Outlet, useNavigate } from 'react-router-dom';
import persistMiddleware from '../service/zustand/middleware/persistMiddleware';



const AdminRoutes = ({ children }) => {

  const { user, isAuthenticated } = persistMiddleware();
  console.log(`⩇⩇:⩇⩇🚨  file: AdminRoutes.jsx:13  user :`, user);
  const navigate = useNavigate();

  const [ok, setOk] = useState(false);

  useEffect(() => {

    if (user && user.token) {
      currentAdmin(user.token)
        .then(res => {
          //res
          console.log(res)
          setOk(true)
        }).catch(err => {
          //err
          console.log(err)
          console.log(`${err.response.data} getOut`);
          // if (err) {
          //   if (isAuthenticated) {
          //     setOk(true)
         
          //     navigate('/member/homepage')

          //   }
          
          // }
          setOk(false)

        })
    }

  }, [user])

  return ok
    ? <Outlet />
    : <LoadingSpinner />
}

export default AdminRoutes