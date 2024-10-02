import { Button } from 'antd'
import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'

const PageNotFound = () => {
    const redirect = useNavigate()
    const navigate = () => {
     
        redirect('/admin/db');

    }
    return (
        <div>
            <div>PageNotFound 404</div>
            <Button type='primary' htmlType='submit' onClick={navigate}>back to homepages</Button>
        </div>
    )
}

export default PageNotFound