import React, { useEffect, useState } from 'react'
import { useNavigate } from "react-router-dom";
import { storeAuth } from '../../service/zustand/store/loginStore';
import { Box, Typography } from '@mui/material';
import { Col, Row } from 'antd';
import '../../DemoAnimation.css'
import persistMiddleware from '../../service/zustand/middleware/persistMiddleware';
import { Spin, Flex, Alert } from 'antd';


const LoadingSpinner = () => {
    const navigate = useNavigate();
    let [count, setCount] = useState(3); //กำหนด 3 = 3 วิ

    const { user } = persistMiddleware();

    const username = storeAuth((state) => state.user)



    useEffect(() => {
        const interval = setInterval(() => {
            setCount((currentCount) => --currentCount);
            if (!user) {
                localStorage.removeItem("token");
                localStorage.removeItem("expirationDate");
            }
            // localStorage.removeItem("token");
            // localStorage.removeItem("expirationDate");
        }, 1000);
        count === 0 && navigate("/auth/login");
        return () => clearInterval(interval);
    }, [count, navigate]);

    const styles = {
        container: {
            display: 'flex',
            justifyContent: 'center', // จัดให้อยู่กลางในแนวนอน
            alignItems: 'center', // จัดให้อยู่กลางในแนวตั้ง
            height: '75vh', // ความสูงของ container เป็น 100% ของ viewport
        },
    };

    const contentStyle = {
        padding: 50,
        background: 'rgba(0, 0, 0, 0.05)',
        borderRadius: 4,
    };
    const content = <div style={contentStyle} />;

    return (
        <div style={styles.container}>
            <Spin tip="Loading" size="large">
                {content}
            </Spin>
        </div>
    );
}

export default LoadingSpinner