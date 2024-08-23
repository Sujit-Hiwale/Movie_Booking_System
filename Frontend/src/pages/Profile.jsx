import React, { useState, useEffect } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useNavigate } from 'react-router-dom';

function Profile() {
  const [userInfo, setUserInfo] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get('http://localhost:8080/api/check_auth', { withCredentials: true })
      .then((response) => {
        if (response.data.authenticated) {
          setUserInfo(response.data.user);
        } else {
          setError('User is not authenticated. Please log in.');
        }
        setLoading(false);
      })
      .catch((error) => {
        setError('Error fetching user information');
        console.error(error);
        setLoading(false);
      });
  }, []);

  const handleLogout = async () => {
    try {
      await axios.post('http://localhost:8080/api/logout', {}, { withCredentials: true });
      navigate('/login'); // Redirect to login page after logout
    } catch (error) {
      console.error('Error logging out:', error);
      setError('Error logging out. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <div className="spinner-border text-light" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        {error}
      </div>
    );
  }

  if (!userInfo) {
    return null;
  }

  return (
    <div className="container mt-5">
      <div className="card shadow-lg bg-dark text-light">
          <h2>Profile of {userInfo.name}</h2>
        <div className="card-body text-center">
          <div className="mb-3">
            <img
              src={userInfo.profilePicture || 'https://static.vecteezy.com/system/resources/thumbnails/019/879/186/small/user-icon-on-transparent-background-free-png.png'}
              alt="Profile"
              className="img-fluid rounded-circle"
            />
          </div>
          <p><strong>Email:</strong> {userInfo.email}</p>
          <p><strong>Phone:</strong> {userInfo.phone || 'Not provided'}</p>
          <p><strong>Role:</strong> {userInfo.role}</p>
          <button className="btn btn-danger mt-3" onClick={handleLogout}>Logout</button>
        </div>
      </div>
    </div>
  );
}

export default Profile;
