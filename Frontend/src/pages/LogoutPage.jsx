import React, { useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Logout() {
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .post('http://localhost:8080/api/logout', {}, { withCredentials: true })
      .then(() => {
        navigate('/');
      })
      .catch((error) => {
        console.error('Error logging out:', error);
      });
  }, [navigate]);

  return <p style={{ textAlign: 'center' }}>Logging out...</p>;
}

export default Logout;
