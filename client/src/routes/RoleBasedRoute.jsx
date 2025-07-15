import { useNavigate, Outlet } from 'react-router-dom';
import persistMiddleware from '../service/zustand/middleware/persistMiddleware';
import { useEffect, useState } from 'react';
import LoadingSpinner from '../components/LoadingSpinner/LoadingSpinner';
import { currentAdmin } from '../service/api/login_register';

const RoleBasedRoute = () => {
    const { user } = persistMiddleware();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [ok, setOk] = useState(false);

    useEffect(() => {
        const checkRole = async () => {
            if (user && user.token) {
                try {
                    if (user.role === 'admin') {
                        await currentAdmin(user.token);
                    }
                    // ถ้าเป็น user จะมี logic ตรวจสิทธิ์ของ user เอง เช่น call currentUser()
                    setOk(true);
                } catch (err) {
                    setOk(false);
                    navigate('/login', { replace: true });
                } finally {
                    setLoading(false);
                }
            } else {
                navigate('/login', { replace: true });
            }
        };

        checkRole();
    }, [user]);

    if (loading) return <LoadingSpinner />;
    return ok ? <Outlet /> : <LoadingSpinner />;
};

export default RoleBasedRoute;
