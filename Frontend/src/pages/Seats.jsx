import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom'; // For navigation and query parameters
import './Seats.css';

const generateRandomUnavailableSeats = (rows, maxSeatsPerRow) => {
  const unavailableSeats = new Set();
  const totalSeats = rows * maxSeatsPerRow;

  // Number of unavailable seats to generate
  const numUnavailableSeats = Math.floor(Math.random() * (totalSeats / 2)); // Up to 25% of total seats

  while (unavailableSeats.size < numUnavailableSeats) {
    const row = String.fromCharCode(65 + Math.floor(Math.random() * rows)); // Generate row letter (A, B, C, ...)
    const seatNumber = Math.floor(Math.random() * maxSeatsPerRow) + 1;
    unavailableSeats.add(`${row}-${seatNumber}`);
  }

  return unavailableSeats;
};

const Seats = () => {
  const [theatres, setTheatres] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentTheatre, setCurrentTheatre] = useState(null);
  const [requiredSeats, setRequiredSeats] = useState(0); // Holds the number of required seats
  const [unavailableSeats, setUnavailableSeats] = useState(new Set()); // State for unavailable seats
  const navigate = useNavigate();
  const location = useLocation(); // For accessing query parameters

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const seatsFromQuery = query.get('seats');
    const theatreNameFromQuery = query.get('theatre');
    setRequiredSeats(Number(seatsFromQuery) || 0);

    axios.get('http://localhost:8080/api/theatres')
      .then(response => {
        if (Array.isArray(response.data) && response.data.length > 0) {
          setTheatres(response.data);
          let theatreData = response.data[0];
          if (theatreNameFromQuery) {
            theatreData = response.data.find(theatre => theatre.name === theatreNameFromQuery) || theatreData;
          }

          setCurrentTheatre(theatreData);

          // Generate random unavailable seats based on rows and max seats per row
          const rows = Object.keys(theatreData.seats).length;
          const maxSeatsPerRow = Math.max(...Object.values(theatreData.seats));
          const simulatedUnavailableSeats = generateRandomUnavailableSeats(rows, maxSeatsPerRow);
          setUnavailableSeats(simulatedUnavailableSeats);
        } else {
          setError('Invalid response format');
        }
      })
      .catch(error => {
        setError('Error fetching theatres data');
        console.error('Error fetching theatres data:', error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [location.search]);

  const handleSeatClick = (row, col) => {
    const seatId = `${row}-${col}`;
    if (unavailableSeats.has(seatId)) {
      alert('This seat is unavailable.');
      return;
    }

    setSelectedSeats(prevSelectedSeats => {
      const updatedSeats = new Set(prevSelectedSeats);
      if (updatedSeats.has(seatId)) {
        updatedSeats.delete(seatId);
      } else if (updatedSeats.size < requiredSeats) {
        updatedSeats.add(seatId);
      } else {
        alert(`You can only select up to ${requiredSeats} seats.`);
      }
      return updatedSeats;
    });
  };

  const handleReserveClick = () => {
    if (selectedSeats.size !== requiredSeats) {
      alert(`Please select exactly ${requiredSeats} seats.`);
      return;
    }

    console.log('Selected Seats:', Array.from(selectedSeats));

    // Simulate successful reservation
    alert('Seats reserved successfully!');
    setSelectedSeats(new Set());
    navigate('/payment'); // Redirect to payment page
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  if (!currentTheatre) return <div>No theatre data available</div>;

  const seatRows = Object.keys(currentTheatre.seats);

  return (
    <div className="seats-container">
      <h1>Seats Availability for {currentTheatre.name}</h1>
      <div className="seats-grid">
        {seatRows.map(row => (
          <div key={row} className="seats-row">
            {Array.from({ length: currentTheatre.seats[row] }).map((_, colIndex) => {
              const seatId = `${row}-${colIndex + 1}`;
              return (
                <div
                  key={colIndex}
                  className={`seat ${unavailableSeats.has(seatId) ? 'unavailable' : selectedSeats.has(seatId) ? 'selected' : 'available'}`}
                  onClick={() => handleSeatClick(row, colIndex + 1)}
                >
                  {row}{colIndex + 1}
                </div>
              );
            })}
          </div>
        ))}
      </div>
      <button onClick={handleReserveClick}>Reserve Seats</button>
    </div>
  );
};

export default Seats;
