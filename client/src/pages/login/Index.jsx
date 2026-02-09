import { useEffect, useState, useRef } from 'react';

import LoginForm from '../../components/form/login/LoginForm';

import { toast } from 'react-toastify';



import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import persistMiddleware from '../../service/zustand/middleware/persistMiddleware';

import room_bg from '../../img/room.jpeg'
import bg from '../../img/pattern_h.png'
import { getImageLogo } from '../../service/api/apartment';

const IndexForm = () => {
    const navigate = useNavigate();
    // const { Login } = storeAuth();
    const Login2 = persistMiddleware((state) => state.Login)
    const { Login, isAuthenticated, user, GetDataApartment } = persistMiddleware();

    const domainNaame = window.location.hostname
    const origin = window.location.origin



    const [loadings, setLoadings] = useState(false)
    const [imgBg, setImgBg] = useState(room_bg)


    const userId = user?.userPayLoad?.user?.id

    const checkStatusAuth = async () => {
        const authStorage = localStorage.getItem('auth-storage');


        if (isAuthenticated) {

            if (user.userPayLoad.user.role === 'User') {
                navigate('/member/homepage')
            } else {
                navigate('/admin/dashboard')
            }
        }

    }

    const hasFetchedLogo = useRef(false)
    useEffect(() => {
        if (hasFetchedLogo.current) return; // guard StrictMode double-invoke
        hasFetchedLogo.current = true;

        const cacheKey = `logo:${domainNaame}`
        const cachedImg = sessionStorage.getItem(cacheKey)
        if (cachedImg) {
            setImgBg(cachedImg)
            return
        }

        const fetchImageLogo = async () => {
            const response = await getImageLogo(domainNaame)
            if (response && response.img) {
                setImgBg(response.img)
                sessionStorage.setItem(cacheKey, response.img)
            }
        }
        fetchImageLogo()
    }, [domainNaame])

    //0 check Status Login
    useEffect(() => {
        if (user) {
            checkStatusAuth();
            GetDataApartment(userId)
        }
    }, [user])


    //1 login โดยการใช้ useForm
    const { register, handleSubmit, formState: { errors }, } = useForm();




    //2 ทำการตรวจสอบ Role
    const checkLevelRole = async (data) => {


        try {

            if (data.user.role === 'User') {
                navigate('/member/homepage')
            } else if (data.user.role === 'admin') {
                navigate('/admin/homepage')
            } else {

                navigate('/admin/dashboard')

            }
        } catch (error) {
            console.log(`⩇⩇:⩇⩇🚨  file: IndexLogin.jsx:39  error :`, error);


        }

    }

    const onSubmit = async (value) => {

        setLoadings(true)
        try {

            const response = await Login(value);
            console.log(`⩇⩇:⩇⩇🚨 ~ response :`, response);


            toast.success(response.messages)

            //const expirationTime = 12 * 60 * 60 * 1000; // 12 ชั่วโมง (เป็นตัวอย่าง)
            const expirationTime = 15 * 60 * 1000; // 15 นาที (900,000 ms)
            //const expirationTime = 60 * 1000; // 12 ชั่วโมง (เป็นตัวอย่าง)
            const expirationDate = new Date().getTime() + expirationTime;
            const one = Number(1)
            localStorage.setItem("token", response.token);
            localStorage.setItem("expirationDate", expirationDate);
            localStorage.setItem('isOnline', one);


            checkLevelRole(response.userPayLoad)


        } catch (error) {
            toast(`🦄 ${error.response.data.message}`, {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "light",

            });

        } finally {
            setLoadings(false);
        }
    }

    return (
        <LoginForm register={register} handleSubmit={handleSubmit} onSubmit={onSubmit} errors={errors} loadings={loadings} imgBg={imgBg} />
    );
};

export default IndexForm;
