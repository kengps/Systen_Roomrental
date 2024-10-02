import React, { useEffect, useState } from 'react';
import { currentAdmin } from '../service/api/login_register';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner/LoadingSpinner';
import persistMiddleware from '../service/zustand/middleware/persistMiddleware';
import { Outlet } from 'react-router-dom';

const AdminRoutes = () => {
  const { user } = persistMiddleware();
  const navigate = useNavigate();

  const [ok, setOk] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdmin = async () => {
      if (user && user.token) {
        try {
          await currentAdmin(user.token);
          setOk(true);
        } catch (err) {
          console.error("Authentication failed:", err); // Log error for debugging
          setOk(false);
          navigate('/login');
        } finally {
          setLoading(false);
        }
      } else {
        setOk(false);
        setLoading(false);
        navigate('/login');
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
