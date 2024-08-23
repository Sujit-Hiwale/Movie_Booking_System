import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useUser } from '../components/UserContext';
import Header from '../components/Header.jsx';
import { useNavigate } from 'react-router-dom';

const Reservation = () => {
    const currentUser = useUser();
    console.log('Current user from context:', currentUser);
    const [reservations, setReservations] = useState([]);
    const [showtimes, setShowtimes] = useState([]);
    const [filteredMovies, setFilteredMovies] = useState([]);
    const [filteredTheatres, setFilteredTheatres] = useState([]);
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        showtime_id: '',
        name: '',
        phone: '',
        seats: '',
        date: '',
        start_at: ''
    });
    const [totalCost, setTotalCost] = useState(0);
    const selectedTheatre = filteredTheatres.find(theatre => theatre.id === formData.theatre_id);

    useEffect(() => {
        axios.get('http://localhost:8080/api/showtime')
            .then(response => {
                console.log('Fetched showtimes:', response.data);
                setShowtimes(response.data);
                setFilteredMovies(getUniqueMovies(response.data));
                setFilteredTheatres(getUniqueTheatres(response.data));
            })
            .catch(error => {
                console.error('Failed to fetch showtimes:', error);
            });
    }, []);

    const startTimes = [
        '9:00 AM', '12:00 PM', '3:00 PM', '6:00 PM', '9:00 PM'
    ];

    const getUniqueMovies = (showtimes) => {
        const uniqueMovies = [];
        const movieSet = new Set();
        showtimes.forEach(showtime => {
            if (!movieSet.has(showtime.movie_id)) {
                movieSet.add(showtime.movie_id);
                uniqueMovies.push({ id: showtime.movie_id, title: showtime.movie_title });
            }
        });
        return uniqueMovies;
    };

    const getUniqueTheatres = (showtimes) => {
        const uniqueTheatres = [];
        const theatreSet = new Set();
        showtimes.forEach(showtime => {
            if (!theatreSet.has(showtime.theatre_id)) {
                theatreSet.add(showtime.theatre_id);
                uniqueTheatres.push({ id: showtime.theatre_id, name: showtime.theatre_name });
            }
        });
        return uniqueTheatres;
    };

    const filterShowtimes = (movieId, theatreId) => {
        console.log('Filtering with movieId:', movieId, 'theatreId:', theatreId);
    
        const filteredShowtimes = showtimes.filter(showtime => 
            showtime.movie_id === Number(movieId) && showtime.theatre_id === Number(theatreId)
        );
    
        console.log('Filtered showtimes:', filteredShowtimes);
    
        if (filteredShowtimes.length > 0) {
            const selectedShowtimeId = filteredShowtimes[0].id;
            setFormData(prevFormData => ({
                ...prevFormData,
                showtime_id: selectedShowtimeId
            }));
            console.log('Selected Showtime ID:', selectedShowtimeId);
            console.log('Current User ID:', currentUser ? currentUser.id : 'No user logged in');
        } else {
            setFormData(prevFormData => ({
                ...prevFormData,
                showtime_id: ''
            }));
            console.log('No showtime available for the selected movie and theatre.');
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        const newValue = name === 'movie_id' || name === 'theatre_id' ? Number(value) : value;
        
        setFormData(prevFormData => {
            const newFormData = {
                ...prevFormData,
                [name]: newValue
            };

            if (name === 'movie_id') {
                setFilteredTheatres(value ? getUniqueTheatres(showtimes.filter(showtime => showtime.movie_id === Number(value))) : getUniqueTheatres(showtimes));
            } else if (name === 'theatre_id') {
                setFilteredMovies(value ? getUniqueMovies(showtimes.filter(showtime => showtime.theatre_id === Number(value))) : getUniqueMovies(showtimes));
            }

            if (name === 'movie_id' || name === 'theatre_id') {
                filterShowtimes(newFormData.movie_id, newFormData.theatre_id);
            }

            if (name === 'seats' || name === 'showtime_id') {
                console.log('Triggering cost calculation:', value, formData.showtime_id);
                calculateTotalCost(name === 'seats' ? value : formData.seats, name === 'showtime_id' ? value : formData.showtime_id);
            }

            return newFormData;
        });
    };

    const calculateTotalCost = (seats, showtimeId) => {
        console.log('Calculating total cost:', seats, showtimeId);
    
        const selectedShowtime = showtimes.find(showtime => showtime.id === Number(showtimeId));
        console.log('Selected showtime:', selectedShowtime);
    
        const ticketPrice = selectedShowtime ? selectedShowtime.ticket_price : 0;
        const totalSeats = Number(seats);
        setTotalCost(ticketPrice * totalSeats);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const reservationData = {
            ...formData,
            user_id: currentUser ? currentUser.id : ''
        };

        console.log('Submitting reservation data:', reservationData);
        if (selectedTheatre) {
            console.log('Selected Theatre Name:', selectedTheatre.name);
        } else {
            console.log('Theatre not found');
        }
        axios.post('http://localhost:8080/api/reservation', reservationData)
            .then(response => {
                alert('Select the seats');
                setReservations([...reservations, reservationData]);
                setFormData({
                    showtime_id: '',
                    name: '',
                    phone: '',
                    seats: '',
                    date: '',
                    start_at: '',
                });
                navigate(`/Seats?seats=${reservationData.seats}&theatre=${selectedTheatre.name}`);
            })
            .catch(error => {
                console.error('Error creating reservation:', error.response ? error.response.data : error.message);
                alert('Failed to create reservation');
            });
    };

    return (
        <div>
            <Header />
            <h1>Reservations</h1>
            <form onSubmit={handleSubmit}>
                <label>
                    Movie:
                    <select name="movie_id" value={formData.movie_id} onChange={handleChange} required>
                        <option value="">Select a movie</option>
                        {filteredMovies.map(movie => (
                            <option key={movie.id} value={movie.id}>{movie.title}</option>
                        ))}
                    </select>
                </label>
                <br />
                <label>
                    Theatre:
                    <select name="theatre_id" value={formData.theatre_id} onChange={handleChange} required>
                        <option value="">Select a theatre</option>
                        {filteredTheatres.map(theatre => (
                            <option key={theatre.id} value={theatre.id}>{theatre.name}</option>
                        ))}
                    </select>
                </label>
                <br />
                <label>
                    Name:
                    <input type="text" name="name" value={formData.name} onChange={handleChange} required />
                </label>
                <br />
                <label>
                    Phone:
                    <input type="text" name="phone" value={formData.phone} onChange={handleChange} required />
                </label>
                <br />
                <label>
                    Seats:
                    <input type="number" name="seats" value={formData.seats} onChange={handleChange} required />
                </label>
                <br />
                <label>
                    Date:
                    <input type="date" name="date" value={formData.date} onChange={handleChange} required />
                </label>
                <br />
                <label>
                    Start Time:
                    <select name="start_at" value={formData.start_at} onChange={handleChange} required>
                        <option value="">Select a time</option>
                        {startTimes.map(time => (
                            <option key={time} value={time}>{time}</option>
                        ))}
                    </select>
                </label>
                <br />
                <p>Total Cost: ${totalCost.toFixed(2)}</p>
                <button type="submit">Reserve Tickets</button>
            </form>
        </div>
    );
};

export default Reservation;
