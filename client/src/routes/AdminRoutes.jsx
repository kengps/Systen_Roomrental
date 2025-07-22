import { useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner/LoadingSpinner';
import { currentAdmin } from '../service/api/login_register';
import persistMiddleware from '../service/zustand/middleware/persistMiddleware';


const AdminRoutes = () => {
  const { user, clearLocalStorage } = persistMiddleware();





  const navigate = useNavigate();

  const [ok, setOk] = useState(false);
  const [loading, setLoading] = useState(true);

  const location = useLocation();

  useEffect(() => {

    const checkAdmin = async () => {

      if (user && user.token) {
        try {

          await currentAdmin(user.token);

          // const res = await api.post('/current-admin', {
          //   headers: { Authorization: `Bearer ${user.token}` }
          // });
          // console.log(`⩇⩇:⩇⩇🚨 ~ checkAdmin ~ res :`, res);




          setOk(true);
        } catch (err) {
         


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
    return <LoadingSpinner />;
  }

  return ok ? <Outlet /> : <LoadingSpinner />; // Consider a different UI for unauthorized users
};

export default AdminRoutes;
