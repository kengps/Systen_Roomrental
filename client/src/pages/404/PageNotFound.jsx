
import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import persistMiddleware from '../../service/zustand/middleware/persistMiddleware'
import { Button, Result } from 'antd';
const PageNotFound = () => {

    const { user } = persistMiddleware();
    console.log(`⩇⩇:⩇⩇🚨  file: PageNotFound.jsx:9  user :`, user);

    const redirect = useNavigate()
    const navigate = () => {

        if (user.userPayLoad.user.role === 'admin') {
            console.log('admin');

            redirect('/admin/dashboard');
        } else {
            console.log('member');
            redirect('/member/homepage');
        }

    }
    return (
        <Result
            status="404"
            title="404"
            subTitle="Sorry, the page you visited does not exist."
            extra={<Button type="primary" onClick={navigate}>Back Home</Button>}
        />
    )
}

export default PageNotFound