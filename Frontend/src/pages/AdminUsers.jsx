import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'Customer'
  });
  const [editingUser, setEditingUser] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    axios.get('http://localhost:8080/api/users')
      .then(response => setUsers(response.data.users))
      .catch(error => setError('Error fetching users'));
  }, []);

  const handleAddUser = () => {
    axios.post('http://localhost:8080/api/users', newUser)
      .then(response => {
        setUsers([...users, { ...newUser, id: response.data.id }]);
        setNewUser({ name: '', email: '', password: '', phone: '', role: 'Customer' });
      })
      .catch(error => {
        const errorMessage = error.response?.data?.error || 'Error adding user';
        setError(errorMessage);
        console.error('Error adding user:', errorMessage);
      });
  };

  const handleDeleteUser = (id) => {
    axios.delete(`http://localhost:8080/api/users/${id}`)
      .then(() => setUsers(users.filter(user => user.id !== id)))
      .catch(error => setError('Error deleting user'));
  };

  const handleUpdateUser = (id) => {
    const updatedUser = {
      ...editingUser,
      role: editingUser.role || 'Customer',
    };
    if (!editingUser.role) {
      setError('Role must be selected');
      return;
  }
    axios.put(`http://localhost:8080/api/users/${id}`, editingUser)
      .then(() => {
        setUsers(users.map(user => (user.id === id ? editingUser : user)));
        setEditingUser(null);
      })
      .catch(error => setError('Error updating user'));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingUser) {
      handleUpdateUser(editingUser.id);
    } else {
      handleAddUser();
    }
  };

  return (
    <div>
      <h2>Admin Users</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <h3>{editingUser ? 'Edit User' : 'Add User'}</h3>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          id="name"
          placeholder="Name"
          value={editingUser ? editingUser.name : newUser.name}
          onChange={e => {
            if (editingUser) {
              setEditingUser({ ...editingUser, name: e.target.value });
            } else {
              setNewUser({ ...newUser, name: e.target.value });
            }
          }}
          autoComplete="name"
          required
        />
        <input
          type="email"
          id="email"
          placeholder="Email"
          value={editingUser ? editingUser.email : newUser.email}
          onChange={e => {
            if (editingUser) {
              setEditingUser({ ...editingUser, email: e.target.value });
            } else {
              setNewUser({ ...newUser, email: e.target.value });
            }
          }}
          autoComplete="email"
          required
        />
        <input
          type="password"
          id="password"
          placeholder="Password"
          value={editingUser ? editingUser.password : newUser.password}
          onChange={e => {
            if (editingUser) {
              setEditingUser({ ...editingUser, password: e.target.value });
            } else {
              setNewUser({ ...newUser, password: e.target.value });
            }
          }}
          autoComplete="new-password"
          required
        />
        <input
          type="text"
          id="phone"
          placeholder="Phone"
          value={editingUser ? editingUser.phone : newUser.phone}
          onChange={e => {
            if (editingUser) {
              setEditingUser({ ...editingUser, phone: e.target.value });
            } else {
              setNewUser({ ...newUser, phone: e.target.value });
            }
          }}
          autoComplete="tel"
        />
        <select
          id="role"
          value={editingUser ? editingUser.role : newUser.role}
          onChange={e => {
            const newRole = e.target.value;
            if (editingUser) {
              setEditingUser({ ...editingUser, role: newRole });
            } else {
              setNewUser({ ...newUser, role: newRole });
            }
          }}
        >
          <option value="Customer">Customer</option>
          <option value="Admin">Admin</option>
        </select>
        <button type="submit">{editingUser ? 'Update User' : 'Add User'}</button>
      </form>

      <h3>User List</h3>
      <ul>
        {users.map(user => (
          <li key={user.id}>
            {user.name} ({user.email})
            <button onClick={() => handleDeleteUser(user.id)}>Delete</button>
            <button onClick={() => setEditingUser({ ...user, role: user.role || 'Customer' })}>Edit</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AdminUsers;
