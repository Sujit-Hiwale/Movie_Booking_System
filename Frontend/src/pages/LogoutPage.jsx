import React, { useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // For redirecting after logout

function Logout() {
  const navigate = useNavigate(); // For redirecting after logout

  useEffect(() => {
    axios
      .post('http://localhost:8080/api/logout', {}, { withCredentials: true })
      .then(() => {
        // Handle successful logout
        navigate('/'); // Redirect to login or home page
      })
      .catch((error) => {
        console.error('Error logging out:', error);
      });
  }, [navigate]);

  return <p style={{ textAlign: 'center' }}>Logging out...</p>;
}

export default Logout;
