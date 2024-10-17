import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useUser } from '../components/UserContext';
import { Table, Container } from 'react-bootstrap';

function UserReservations() {
  const currentUser = useUser();
  const [reservations, setReservations] = useState([]);
  const [showtimes, setShowtimes] = useState([]);

  useEffect(() => {
    if (currentUser && currentUser.id) {
      axios.all([
        axios.get(`http://localhost:8080/api/reservation?user_id=${currentUser.id}`),
        axios.get('http://localhost:8080/api/showtime')
      ])
      .then(axios.spread((reservationsResponse, showtimesResponse) => {
        const reservationsData = reservationsResponse.data;
        const showtimesData = showtimesResponse.data;

        const showtimesMap = showtimesData.reduce((map, showtime) => {
          map[showtime.id] = showtime;
          return map;
        }, {});

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
                <td>{reservation.movie_title}</td> {}
                <td>{reservation.theatre_name}</td> {}
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
