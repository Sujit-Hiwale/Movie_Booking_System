import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';

const Reservation = () => {
    const [showtimes, setShowtimes] = useState([]);
    const [users, setUsers] = useState([]);
    const [movies, setMovies] = useState([]);
    const [theatres, setTheatres] = useState([]);
    const [form, setForm] = useState({
        movie_id: '',
        theatre_id: '',
        name: '',
        phone: '',
        seats: '',
        date: '',
        start_at: ''
    });
    const [filteredTheatres, setFilteredTheatres] = useState([]);
    const [filteredShowtimes, setFilteredShowtimes] = useState([]);
    const [showtimeId, setShowtimeId] = useState(null);
    const [totalCost, setTotalCost] = useState(0);
    const times = [
        '10:00 AM', '11:00 AM', '12:00 PM', '01:00 PM',
        '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM',
        '06:00 PM', '07:00 PM', '08:00 PM', '09:00 PM'
      ];
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const location = useLocation();
    const navigate = useNavigate(); // Initialize useNavigate hook
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch showtimes and users concurrently
                const [showtimesResponse, usersResponse] = await Promise.all([
                    axios.get('http://localhost:8080/api/showtime'),
                    axios.get('http://localhost:8080/api/users')
                ]);
    
                // Extract showtimes and users
                const showtimesData = showtimesResponse.data;
                const usersData = usersResponse.data.users;
    
                // Extract unique movies and theatres from showtimes
                const uniqueMovies = Array.from(new Set(showtimesData.map(showtime => showtime.movie_title)));
                const uniqueTheatres = Array.from(new Set(showtimesData.map(showtime => showtime.theatre_name)));
    
                // Update state
                setShowtimes(showtimesData);
                setMovies(uniqueMovies);
                setTheatres(uniqueTheatres);
                setUsers(usersData);
            } catch (error) {
                console.error('Failed to fetch data:', error);
                setError('Failed to fetch data');
            } finally {
                setLoading(false);
            }
        };
    
        fetchData();
    }, []);
    

    useEffect(() => {
        // Function to get unique values from an array of objects based on a key
        const getUniqueValues = (data, key) => Array.from(new Set(data.map(item => item[key])));
    
        const updateFilteredData = () => {
            // Filter showtimes based on selected movie and/or theatre
            const filtered = showtimes.filter(showtime =>
                (!form.movie_id || showtime.movie_id === Number(form.movie_id)) &&
                (!form.theatre_id || showtime.theatre_id === Number(form.theatre_id))
            );
            
            // Update filtered showtimes
            setFilteredShowtimes(filtered);
    
            // Update filtered theatres based on the selected movie
            if (form.movie_id) {
                const filteredTheatres = getUniqueValues(
                    showtimes.filter(showtime => showtime.movie_id === Number(form.movie_id)), 
                    'theatre_name'
                );
                setFilteredTheatres(filteredTheatres);
            } else {
                setFilteredTheatres(getUniqueValues(showtimes, 'theatre_name'));
            }
    
            // Update movies based on the selected theatre
            if (form.theatre_id) {
                const filteredMovies = getUniqueValues(
                    showtimes.filter(showtime => showtime.theatre_id === Number(form.theatre_id)), 
                    'movie_title'
                );
                setMovies(filteredMovies);
            } else {
                setMovies(getUniqueValues(showtimes, 'movie_title'));
            }
        };
    
        updateFilteredData();
    
        console.log('Filtered Theatres:', filteredTheatres);
    }, [form.movie_id, form.theatre_id, showtimes]);
    
    console.log('Final Filtered Theatres:', filteredTheatres);
    ;

    useEffect(() => {
        // Extract form values for readability
        const { movie_id, theatre_id, date, seats } = form;
    
        if (date && seats && movie_id && theatre_id) {
            // Find the ticket price from the filtered showtimes
            const showtime = filteredShowtimes.find(
                showtime => showtime.movie_id === Number(movie_id) && showtime.theatre_id === Number(theatre_id)
            );
            const ticketPrice = showtime?.ticket_price || 0;
    
            // Calculate total cost
            const totalSeats = Number(seats);
            setTotalCost(ticketPrice * totalSeats);
        } else {
            setTotalCost(0);
        }
    }, [form.date, form.seats, filteredShowtimes, form.movie_id, form.theatre_id]);
    

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prevForm => ({
            ...prevForm,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const user = users.find(user => user.name === form.name);

        if (!user) {
            setError('Incorrect name of the user');
            return;
        }
        
    const formattedTime = formatTime(form.start_at);

        const updatedForm = { ...form, user_id: user.id };
        console.log('Submitting reservation with data:', updatedForm);

        if (!updatedForm.movie_id || !updatedForm.theatre_id || !updatedForm.user_id || !updatedForm.seats || !updatedForm.date) {
            console.error('Missing required fields:', updatedForm);
            setError('Please fill in all required fields.');
            return;
        }

        try {
            const response = await axios.post('http://localhost:8080/api/reservation', updatedForm);
            console.log('Reservation response:', response.data);
            const { message, order_id } = response.data;

            // Handle the successful reservation response
            alert(`Reservation made successfully! Your Order ID is: ${order_id}`);

            // Redirect to confirmation page with order_id
            navigate(`/confirmation/${order_id}`);
        } catch (error) {
            console.error('Failed to make reservation:', error.response ? error.response.data : error.message);
            setError('Failed to make reservation');
        }
    };

    const formatTime = (timeString) => {
        // Split time string into hours, minutes, and period (AM/PM)
        let [hours, minutes, period] = timeString.split(/[:\s]/);
        hours = parseInt(hours, 10);
        minutes = parseInt(minutes, 10);
    
        // Adjust hours based on AM/PM
        if (period.toUpperCase() === 'PM' && hours !== 12) {
            hours += 12;
        } else if (period.toUpperCase() === 'AM' && hours === 12) {
            hours = 0;
        }
    
        // Format hours and minutes to ensure they are two digits
        const formattedHours = hours.toString().padStart(2, '0');
        const formattedMinutes = minutes.toString().padStart(2, '0');
    
        // Return time in HH:MM:SS format
        return `${formattedHours}:${formattedMinutes}:00`;
    };
    

    if (loading) return <p>Loading...</p>;
    if (error) return <p>{error}</p>;

    return (
        <div style={{ padding: '20px' }}>
            <h1>Make a Reservation</h1>
            <form onSubmit={handleSubmit}>
                <label>
                    Movie:
                    <select name="movie_id" value={form.movie_id} onChange={handleChange}>
                        <option value="">Select Movie</option>
                        {filteredShowtimes.map(showtime => (
                        <option key={showtime.movie_id} value={showtime.movie_id}>
                        {showtime.movie_title}
                            </option>
                        ))}
                    </select>
                </label>
                <label>
                    Theatre:
                    <select name="theatre_id" value={form.theatre_id} onChange={handleChange}>
                        <option value="">Select Theatre</option>
                        {filteredTheatres.map((theatre, index) => (
                            <option key={index} value={index + 1}>
                                {theatre}
                            </option>
                        ))}
                    </select>
                </label>
                <label>
                    Name:
                    <input type="text" name="name" value={form.name} onChange={handleChange} required />
                </label>
                <label>
                    Date:
                    <input type="date" name="date" value={form.date} onChange={handleChange} required />
                </label>
                <label>
                    Phone:
                    <input type="text" name="phone" value={form.phone} onChange={handleChange} required />
                </label>
                <label>
                    Start Time:
                    <select name="start_at" value={form.start_at} onChange={handleChange}>
                        <option value="">Select Time</option>
                        {times.map((time, index) => (
                            <option key={index} value={time}>
                                {time}
                            </option>
                        ))}
                    </select>
                </label>
                <label>
                    Number of Seats:
                    <input type="number" name="seats" value={form.seats} onChange={handleChange} required />
                </label>
                <p>Total Cost: ${totalCost.toFixed(2)}</p>
                <button type="submit">Reserve</button>
            </form>
        </div>
    );
};

export default Reservation;
