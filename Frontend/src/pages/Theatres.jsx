import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header.jsx';
import 'bootstrap/dist/css/bootstrap.min.css';

function Theatres() {
  const [theatres, setTheatres] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTheatres();
  }, []);

  const fetchTheatres = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/theatres');
      setTheatres(response.data);
    } catch (error) {
      console.error('Error fetching theatres:', error);
    }
  };

  const calculateTotalSeats = (seats) => {
    try {
      const seatsObj = typeof seats === 'string' ? JSON.parse(seats) : seats;
      return Object.values(seatsObj).reduce((total, count) => total + count, 0);
    } catch (error) {
      console.error('Error calculating total seats:', error);
      return 'N/A';
    }
  };

  const handleTheatreClick = () => {
  navigate(`/reservation`);
};

  return (
    <div className="container mt-5">
    <Header />
      <h1 className="text-center mb-4">Theatres</h1>
      <div className="row">
        {theatres.map((theatre) => (
          <div className="col-md-4 mb-4" style={{ cursor: 'pointer' }} onClick={() => handleTheatreClick(theatre.name)} key={theatre.id}>
            <div className="card bg-dark text-light">
              {theatre.image && (
                <img
                  src={theatre.image}
                  alt={theatre.name}
                  className="card-img-top"
                  style={{ height: '200px', objectFit: 'cover' }}
                />
              )}
              <div className="card-body text-center">
                <h5 className="card-title">{theatre.name}</h5>
                <p className="card-text"><strong>City:</strong> {theatre.city}</p>
                <p className="card-text"><strong>Ticket Price:</strong> ${theatre.ticket_price}</p>
                <p className="card-text"><strong>Total Seats:</strong> {calculateTotalSeats(theatre.seats)}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Theatres;
