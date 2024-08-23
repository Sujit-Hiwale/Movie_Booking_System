import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Header from '../components/Header.jsx';

const Showtimes = () => {
    const [showtimes, setShowtimes] = useState([]);
    const [movies, setMovies] = useState([]);
    const [theatres, setTheatres] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [showtimeRes, movieRes, theatreRes] = await Promise.all([
                    axios.get('http://localhost:8080/api/showtime'),
                    axios.get('http://localhost:8080/api/movies'),
                    axios.get('http://localhost:8080/api/theatres')
                ]);

                setShowtimes(showtimeRes.data);
                setMovies(movieRes.data);
                setTheatres(theatreRes.data);
            } catch (error) {
                setError('Failed to fetch data');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const getMovieName = (movieId) => {
        const movie = movies.find(m => m.id === movieId);
        return movie ? movie.title : 'Unknown Movie';
    };

    const getTheatreName = (theatreId) => {
        const theatre = theatres.find(t => t.id === theatreId);
        return theatre ? theatre.name : 'Unknown Theatre';
    };

    if (loading) return <p>Loading...</p>;
    if (error) return <p>{error}</p>;

    return (
        <div style={{ padding: '20px' }}>
      <Header />
            <h1>Showtimes</h1>
            {showtimes.map(showtime => (
                <div key={showtime.id} className="bg-dark text-light" style={{ marginBottom: '20px', border: '1px solid #ddd', padding: '10px' }}>
                    <div><strong>Movie:</strong> {getMovieName(showtime.movie_id)}</div>
                    <div><strong>Theatre:</strong> {getTheatreName(showtime.theatre_id)}</div>
                    <div><strong>Ticket Price:</strong> ${showtime.ticket_price}</div>
                    <div><strong>Start Date:</strong> {new Date(showtime.start_date).toLocaleDateString()}</div>
                    <div><strong>End Date:</strong> {new Date(showtime.end_date).toLocaleDateString()}</div>
                </div>
            ))}
        </div>
    );
};

export default Showtimes;