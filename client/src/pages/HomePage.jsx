import React from 'react'
import { Button } from 'antd'
import persistMiddleware from '../service/zustand/middleware/persistMiddleware'
const HomePage = () => {
    const { Logout } = persistMiddleware();

    const handleLogout = () => {
        Logout();
    }
    console.log("Rendering HomePage");
    return (
        <div>
            <div>HomePage</div>
            <Button onClick={Logout}>Logout</Button>
        </div>
    )
}

export default HomePage