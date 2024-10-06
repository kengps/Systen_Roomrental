import { Button } from 'antd'
import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import persistMiddleware from '../../service/zustand/middleware/persistMiddleware'

const PageNotFound = () => {

    const { user } = persistMiddleware();
    console.log(`⩇⩇:⩇⩇🚨  file: PageNotFound.jsx:9  user :`, user);

    const redirect = useNavigate()
    const navigate = () => {

        if(user.userPayLoad.user.role === 'admin'){
            console.log('admin');
            
            redirect('/admin/dashboard');
        }else {
            console.log('member');
            redirect('/member/homepage');
        }

    }
    return (
        <div>
            <div>PageNotFound 40445345</div>
            <Button type='primary' htmlType='submit' onClick={navigate}>back to homepages</Button>
        </div>
    )
}

export default PageNotFound