import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Login.css';

function Login() {
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

async function handleSubmit(event) {
    event.preventDefault();

    console.log('Username or Email:', usernameOrEmail);
    console.log('Password:', password);

    try {
        const response = await fetch('http://localhost:8080/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include', 
            body: JSON.stringify({
                username_or_email: usernameOrEmail,
                password: password
            })
        });

        if (!response.ok) {
            const error = await response.json();
            console.error('Error during login:', error);
            alert('Login failed: ' + (error.error || 'Unknown error'));
        } else {
            const result = await response.json();
            console.log('Login successful:', result);
            navigate('/');
        }
    } catch (error) {
        console.error('Network error:', error);
        alert('Network error: ' + error.message);
    }
}

return (
  <div className="d-flex justify-content-center align-items-center vh-100">
    <div className="card p-4 shadow bg-dark text-white" style={{ maxWidth: '400px', width: '100%' }}>
      <h2 className="text-center mb-4">Login</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group mb-3">
          <label htmlFor="usernameOrEmail">Username or Email</label>
          <input
            type="text"
            className="form-control"
            id="usernameOrEmail"
            placeholder="Enter username or email"
            value={usernameOrEmail}
            onChange={(e) => setUsernameOrEmail(e.target.value)}
          />
        </div>
        <div className="form-group mb-3">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            className="form-control"
            id="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button type="submit" className="btn btn-primary w-100">Login</button>
        {error && <div className="alert alert-danger mt-3">{error}</div>}
      </form>
      <div className="text-center mt-3">
          <p className="mb-0">Don't have an account?</p>
          <Link to="/signup" className="link-blue">Sign Up</Link>
        </div>
    </div>
  </div>
);
}

export default Login;
