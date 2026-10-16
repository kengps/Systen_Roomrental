import {useEffect, useState, useRef} from 'react';
import {Outlet, useLocation, useNavigate} from 'react-router-dom';
import LoadingComponent from '../components/LoadingSpinner/LoadingComponent';
import {currentAdmin} from '../service/api/login_register';
import persistMiddleware from '../service/zustand/middleware/persistMiddleware';
import { notify } from '../utilities/notify';


const AdminRoutes = () => {
    const {user, clearLocalStorage} = persistMiddleware();

    const navigate = useNavigate();

    const [ok, setOk] = useState(false);
    const [loading, setLoading] = useState(true);

    const location = useLocation();
    const lastTokenRef = useRef(null);

    useEffect(() => {
        if (user && user.token && user.token === lastTokenRef.current) return;

        const checkAdmin = async () => {
            if (user && user.token) {
                lastTokenRef.current = user.token;
                try {
                    let res = await currentAdmin(user.token);
                    console.log("🚀 ~ checkAdmin ~ res: ", res);
                    setOk(true);
                } catch (err) {
                    lastTokenRef.current = null;
                    const message = err?.response?.data?.message || 'การเข้าถึงถูกปฏิเสธ';
                    notify.error(message);
                    clearLocalStorage()
                    setOk(false);
                    navigate('/auth/login');
                } finally {
                    setLoading(false);
                }
            } else {
                setOk(false);
                setLoading(false);
                navigate('/auth/login');
            }
        };

        checkAdmin();
    }, [user, navigate]);

    if (loading) {
        return <LoadingComponent
            text="กำลังโหลด"
            variant="spinner"
            size="md"
        />
    }

    return ok ? <Outlet/> : <LoadingComponent
        text="กำลังโหลด"
        variant="spinner"
        size="md"
    />; // Consider a different UI for unauthorized users
};

export default AdminRoutes;
