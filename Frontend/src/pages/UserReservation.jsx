import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useUser } from '../components/UserContext';
import { Table, Container } from 'react-bootstrap';

function UserReservations() {
  const currentUser = useUser(); // Get the current user from context
  const [reservations, setReservations] = useState([]);
  const [showtimes, setShowtimes] = useState([]);

  useEffect(() => {
    if (currentUser && currentUser.id) {
      // Fetch reservations and showtimes in parallel
      axios.all([
        axios.get(`http://localhost:8080/api/reservation?user_id=${currentUser.id}`),
        axios.get('http://localhost:8080/api/showtime') // Assuming this endpoint returns all showtimes
      ])
      .then(axios.spread((reservationsResponse, showtimesResponse) => {
        const reservationsData = reservationsResponse.data;
        const showtimesData = showtimesResponse.data;
        
        // Map showtimes to a dictionary for easy lookup
        const showtimesMap = showtimesData.reduce((map, showtime) => {
          map[showtime.id] = showtime;
          return map;
        }, {});

        // Update reservations with movie and theatre names from showtimes
        const updatedReservations = reservationsData.map(reservation => {
          const showtime = showtimesMap[reservation.showtime_id];
          return {
            ...reservation,
            movie_title: showtime ? showtime.movie_title : 'N/A',
            theatre_name: showtime ? showtime.theatre_name : 'N/A'
          };
        });

        setReservations(updatedReservations);
        setShowtimes(showtimesData);
      }))
      .catch(error => {
        console.error('Error fetching data:', error);
      });
    }
  }, [currentUser]);

  return (
    <Container>
      <h1>Your Reservations</h1>
      {reservations.length > 0 ? (
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Movie</th>
              <th>Theatre</th>
              <th>Seats</th>
              <th>Date</th>
              <th>Start Time</th>
            </tr>
          </thead>
          <tbody>
            {reservations.map(reservation => (
              <tr key={reservation.id}>
                <td>{reservation.movie_title}</td> {/* Display movie title */}
                <td>{reservation.theatre_name}</td> {/* Display theatre name */}
                <td>{reservation.seats}</td>
                <td>{reservation.date}</td>
                <td>{reservation.start_at}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      ) : (
        <p>No reservations found.</p>
      )}
    </Container>
  );
}

export default UserReservations;
