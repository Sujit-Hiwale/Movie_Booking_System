import React, { useEffect, useState } from 'react';

const AdminReservation = () => {
  const [reservations, setReservations] = useState([]);
  const [form, setForm] = useState({
    id: '',
    showtime_id: '',
    name: '',
    phone: '',
    seats: '',
    date: '',
    start_at: '',
    user_id: '',
  });

  const fetchReservations = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/reservation');
      const data = await response.json();
      setReservations(data);
    } catch (error) {
      console.error('Error fetching reservations:', error);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const method = form.id ? 'PUT' : 'POST';
    const url = form.id ? `http://localhost:8080/api/reservation/${form.id}` : 'http://localhost:8080/api/reservation';
    try {
      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (response.ok) {
        fetchReservations();
        setForm({ id: '', showtime_id: '', name: '', phone: '', seats: '', date: '', start_at: '', user_id: '' });
      } else {
        console.error(`Error ${method === 'POST' ? 'creating' : 'updating'} reservation`);
      }
    } catch (error) {
      console.error(`Error ${method === 'POST' ? 'creating' : 'updating'} reservation:`, error);
    }
  };

  const handleEdit = (reservation) => {
    setForm({
      id: reservation.id,
      showtime_id: reservation.showtime_id,
      name: reservation.name,
      phone: reservation.phone,
      seats: reservation.seats,
      date: reservation.date,
      start_at: reservation.start_at,
      user_id: reservation.user_id,
    });
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`http://localhost:8080/api/reservation/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        fetchReservations();
      } else {
        console.error('Error deleting reservation');
      }
    } catch (error) {
      console.error('Error deleting reservation:', error);
    }
  };

  return (
    <div>
      <h1>Admin Reservation Management</h1>

      <form onSubmit={handleFormSubmit}>
        <input
          type="text"
          name="showtime_id"
          placeholder="Showtime ID"
          value={form.showtime_id}
          onChange={handleInputChange}
          required
        />
        <input
          type="text"
          name="name"
          placeholder="Name"
          value={form.name}
          onChange={handleInputChange}
          required
        />
        <input
          type="text"
          name="phone"
          placeholder="Phone"
          value={form.phone}
          onChange={handleInputChange}
          required
        />
        <input
          type="number"
          name="seats"
          placeholder="Seats"
          value={form.seats}
          onChange={handleInputChange}
          required
        />
        <input
          type="date"
          name="date"
          value={form.date}
          onChange={handleInputChange}
          required
        />
        <label>
          <select name="start_at" value={form.start_at} onChange={handleInputChange} required>
            <option value="">Select a time</option>
            <option value="09:00">09:00 AM</option>
            <option value="12:00">12:00 PM</option>
            <option value="15:00">03:00 PM</option>
            <option value="18:00">06:00 PM</option>
            <option value="21:00">09:00 PM</option>
          </select>
        </label>
        <input
          type="text"
          name="user_id"
          placeholder="User ID"
          value={form.user_id}
          onChange={handleInputChange}
          required
        />
        <button type="submit">{form.id ? 'Update Reservation' : 'Add Reservation'}</button>
      </form>

      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Order ID</th>
            <th>Showtime ID</th>
            <th>User ID</th>
            <th>Seats</th>
            <th>Date</th>
            <th>Start Time</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {reservations.map((reservation) => (
            <tr key={reservation.id}>
              <td>{reservation.id}</td>
              <td>{reservation.order_id}</td>
              <td>{reservation.showtime_id}</td>
              <td>{reservation.user_id}</td>
              <td>{reservation.seats}</td>
              <td>{reservation.date}</td>
              <td>{reservation.start_at}</td>
              <td>
                <button onClick={() => handleEdit(reservation)}>Edit</button>
                <button onClick={() => handleDelete(reservation.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminReservation;
