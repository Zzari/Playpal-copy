import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config.js';

export const useUser = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log('Fetching user info');
    const fetchUser = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_BASE_URL}/auth/me`, {
          withCredentials: true
        });
        console.log("useUser.js", res.data);
        console.log('User info:', res.data.user);        
        setUser(res.data.user);
        setError(null);
      } catch (err) {
        console.error('Error fetching user data:', err);
        if (err.response) {
          console.error('Server response:', err.response.data);
        }
        setError(err);
        setUser(null);
      } finally {
        setLoading(false);
        console.log('User data fetching complete');
      }
    };

    fetchUser();
  }, []);

  return { user, loading, error };
};
