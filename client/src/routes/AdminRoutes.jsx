import React, { useEffect, useState } from 'react';
import { currentAdmin } from '../service/api/login_register';
import { useLocation, useNavigate } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner/LoadingSpinner';
import persistMiddleware from '../service/zustand/middleware/persistMiddleware';
import { Outlet } from 'react-router-dom';


const AdminRoutes = () => {
  const { user } = persistMiddleware();
  const navigate = useNavigate();

  const [ok, setOk] = useState(false);
  const [loading, setLoading] = useState(true);

  const location = useLocation();
  console.log('====================================');
  console.log(location);
  console.log('====================================');

 
  useEffect(() => {
    
    const checkAdmin = async () => {
      if (user && user.token) {
        try {
          await currentAdmin(user.token);
          setOk(true);
        } catch (err) {
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
