import React, { useEffect } from 'react';
import { Paper, Avatar, Typography, TextField, Button, Box, Container } from '@mui/material';
import Grid from '@mui/material/Grid';
import { Row, Col } from 'antd';

import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import bg from '../../img/pattern_h.png';
import LoginForm from '../../components/form/login/LoginForm';

import { toast } from 'react-toastify';



import { useForm } from 'react-hook-form'
import { storeAuth } from '../../service/zustand/store/loginStore';
import { createActionCreatorInvariantMiddleware } from '@reduxjs/toolkit';
import { useNavigate } from 'react-router-dom';
import persistMiddleware from '../../service/zustand/middleware/persistMiddleware';


const IndexForm = () => {
    const navigate = useNavigate();


    //0 check Status Login
    useEffect(() => {
        checkStatusAuth();
    }, [])
    const checkStatusAuth = () => {
        const authStorage = localStorage.getItem('auth-storage');

        if (isAuthenticated) return navigate('/')

    }
    //1 login โดยการใช้ useForm
    const { register, handleSubmit, formState: { errors }, } = useForm();

    // const { Login } = storeAuth();
    const Login2 = persistMiddleware((state) => state.Login)
    const { Login, isAuthenticated } = persistMiddleware();

    //2 ทำการตรวจสอบ Role
    const checkLevelRole = async (data) => {
        console.log(`⩇⩇:⩇⩇🚨  file: IndexLogin.jsx:30  data :`, data);

        try {
            if (data.user.role === 'user') {
                navigate('/member/homepage')
            } else {
                navigate('/admin/dashboard')
            }
        } catch (error) {
            console.log(`⩇⩇:⩇⩇🚨  file: IndexLogin.jsx:39  error :`, error);


        }

    }

    const onSubmit = async (value) => {
    console.log(`⩇⩇:⩇⩇🚨  file: Index.jsx:61  value :`, value);


        try {
            const response = await Login(value);
            console.log(`⩇⩇:⩇⩇🚨  file: IndexLogin.jsx:31  response  :`, response);


            toast.success(response.messages)

            const expirationTime = 12 * 60 * 60 * 1000; // 12 ชั่วโมง (เป็นตัวอย่าง)
            //const expirationTime = 60 * 1000; // 12 ชั่วโมง (เป็นตัวอย่าง)
            const expirationDate = new Date().getTime() + expirationTime;
            const one = Number(1)
            localStorage.setItem("token", response.token);
            localStorage.setItem("expirationDate", expirationDate);
            localStorage.setItem('isOnline', one);

            checkLevelRole(response.userPayLoad)


        } catch (error) {

            toast('🦄 Wow so easy!', {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "light",

            });

        }
    }

    return (
        <LoginForm register={register} handleSubmit={handleSubmit} onSubmit={onSubmit} errors={errors} />
    );
};

export default IndexForm;
