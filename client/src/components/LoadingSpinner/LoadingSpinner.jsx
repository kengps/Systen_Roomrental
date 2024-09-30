import React, { useEffect, useState } from 'react'
import { useNavigate } from "react-router-dom";
import { storeAuth } from '../../service/zustand/store/loginStore';
import { Box, Typography } from '@mui/material';

import '../../DemoAnimation.css'


const LoadingSpinner = () => {
    const navigate = useNavigate();
    let [count, setCount] = useState(5); //กำหนด 3 = 3 วิ

    const { user } = storeAuth();

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
        count === 0 && navigate("/login");
        return () => clearInterval(interval);
    }, [count, navigate]);

    return (
        <Box
            className="demo" // Complex animations are in external CSS
            sx={{
                position: 'absolute',
                left: '50%',
                top: '50%',
                width: '500px',
                height: '140px',
                transform: 'translateX(-50%)',
                padding: '10px',
                borderRadius: '20px',
                overflow: 'hidden',
            }}
        >
            {/* Colored Blocks */}
            <Box
                className="demo__colored-blocks"
                sx={{
                    position: 'absolute',
                    left: '50%',
                    top: '0',
                    width: '500px',
                    height: '100%',
                    marginLeft: '-250px',
                    padding: '10px',
                    perspective: '1000px',
                }}
            >
                <Box className="demo__colored-blocks-rotater">
                    <Box className="demo__colored-block" sx={{ backgroundColor: '#FD3359' }}></Box>
                    <Box className="demo__colored-block" sx={{ backgroundColor: '#F4D302' }}></Box>
                    <Box className="demo__colored-block" sx={{ backgroundColor: '#21BDFF' }}></Box>
                </Box>
                <Box className="demo__colored-blocks-inner" sx={{ backgroundColor: '#32386D' }}></Box>
                <Typography className="demo__text" sx={{ color: '#fff', fontSize: '100px' }}>
                    Ready
                </Typography>
            </Box>

            {/* SVG Number Animation */}
            <Box className="demo__inner">
                <svg className="demo__numbers" viewBox="0 0 100 100">
                    <path
                        className="demo__numbers-path"
                        d="M-10,20 60,20 40,50 a18,15 0 1,1 -12,19 Q25,44 34.4,27.4 l7,-7 a16,16 0 0,1 22.6,22.6 l-30,30 l35,0 L69,73 a20,10 0 0,1 20,10 a17,17 0 0,1 -34,0 L55,83 l0,-61 L40,28"
                    />
                </svg>
            </Box>
        </Box>
    );
}

export default LoadingSpinner