import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { checkAdminSession } from '../lib/api';
import type { AdminUser } from '../types';

export function useAdminAuth() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [user, setUser] = useState<AdminUser | null>(null);

  useEffect(() => {
    let active = true;
    checkAdminSession()
      .then((res) => {
        if (!active) return;
        if (res.success && res.data) {
          setAuthenticated(true);
          setUser(res.data);
          setLoading(false);
        } else {
          setAuthenticated(false);
          setUser(null);
          setLoading(false);
          navigate('/admin/login', { replace: true });
        }
      })
      .catch(() => {
        if (!active) return;
        setAuthenticated(false);
        setUser(null);
        setLoading(false);
        navigate('/admin/login', { replace: true });
      });

    return () => {
      active = false;
    };
  }, [navigate]);

  return { loading, authenticated, user };
}
