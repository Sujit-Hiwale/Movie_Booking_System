import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Container } from 'react-bootstrap';
import Header from '../components/Header.jsx';
import { motion } from 'framer-motion';
import Footer from '../components/Footer.jsx';

function HomePage() {
  const [username, setUsername] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [movies, setMovies] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    axios.get('http://localhost:8080/api/check_auth', { withCredentials: true })
      .then((response) => {
        if (response.data.authenticated) {
          setUsername(response.data.user.name);
          setUserRole(response.data.user.role);
        } else {
          setUsername(null);
          setUserRole(null);
        }
      })
      .catch((error) => {
      });
  }, []);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/movies', { withCredentials: true });
        if (response.data) {
          setMovies(response.data);
        } else {
          setError('No movies found');
        }
      } catch (error) {
        setError('Error fetching movies');
        console.error('Error fetching movies:', error);
      }
    };

    fetchMovies();
  }, []);

  const filteredMovies = searchTerm
  ? movies.filter(movie =>
      movie.title.toLowerCase().includes(searchTerm.toLowerCase())
    )
  : movies;
  
  const visibleCount = 5;
  const extendedMovies = [...filteredMovies, ...filteredMovies];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => {
        const maxIndex = Math.max(filteredMovies.length, 1);
        return (prevIndex + 1) % maxIndex;
      });
    }, 5000); // Change every 5 seconds
    return () => clearInterval(interval);
  }, [filteredMovies]);

  const startIndex = Math.max(currentIndex, 0);
  const endIndex = startIndex + visibleCount;
  const displayedMovies = extendedMovies.slice(startIndex, endIndex);
  
  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

    const handlePrevious = () => {
    setCurrentIndex((prevIndex) => {
      const maxIndex = Math.max(filteredMovies.length, 1);
      return (prevIndex - 1 + maxIndex) % maxIndex;
    });
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) => {
      const maxIndex = Math.max(filteredMovies.length, 1);
      return (prevIndex + 1) % maxIndex;
    });
  };

  return (
    <>
    <Header />
      <Container className="mt-5 pt-4">
        {searchTerm && filteredMovies.length > 0 && (
          <div style={{
            position: 'absolute',
            top: '80px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '50%',
            maxHeight: '300px',
            overflowY: 'auto',
            backgroundColor: 'white',
            border: '1px solid #ced4da',
            borderRadius: '5px',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
            zIndex: 1000,
            textAlign: 'left',
            padding: '10px',
          }}>
            {filteredMovies.map((movie) => (
              <div
                key={movie.id}
                style={{ padding: '10px', cursor: 'pointer' }}
                onClick={() => handleResultClick(movie.id)}
              >
                <img src={movie.image || 'placeholder-image-url'} alt={movie.title} style={{ width: '50px', marginRight: '10px' }} />
                <strong>{movie.title}</strong> - <span>{movie.genre}</span>
              </div>
            ))}
          </div>
        )}
        {!searchTerm && (
          <div style={{position: 'absolute',
            top: '80px',
            left: '50%',  // Center horizontally
            transform: 'translateX(-50%)',  // Center horizontally
            width: '50%',  // Ensure the width is consistent
            maxHeight: '300px',
            zIndex: 1000,
            textAlign: 'left',}}>
            <Container style={{ marginTop: '0%'}}>
              <div className="d-flex align-items-center justify-content-center" style={{ whiteSpace: 'nowrap' }}>
                <Link to="/theatres" className="mx-4">Theatres</Link>
                <Link to="/showtimes" className="mx-4">Showtimes</Link>
                <Link to="/genres" className="mx-4">Genres</Link>
                {username && (
                  <>
                    <Link to="/reservation" className="mx-4">Reservation</Link>
                    {userRole === 'Admin' && (
                      <Link to="/admin_dashboard" className="mx-4">Admin Dashboard</Link>
                    )}
                  </>
                )}
              </div>
            </Container>
          </div>
        )}
        {error && (
          <p className="text-danger text-center">
            {error}
          </p>
        )}
      </Container>
      {displayedMovies.length > 0 && !searchTerm && (
        <div style={{ padding: '20px', position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
          <button onClick={handlePrevious} style={{ marginRight: '10px',backgroundColor: 'transparent', border: 'none', color: 'grey', fontSize: '48px', padding: '0'}}>&lt;</button>
          <motion.div 
            key={currentIndex}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 1 }}
            style={{ display: 'flex', overflow: 'hidden' }}>
            {displayedMovies.map((movie) => (
              <div key={movie.id} style={{ border: '1px solid #ddd', borderRadius: '8px', overflow: 'hidden', width: '200px' }}>
                <Link to={`/movies/${movie.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  {movie.image ? (
                    <img src={movie.image} alt={movie.title} style={{ width: '100%', height: 'auto' }} />
                  ) : (
                    <div style={{ width: '100%', height: '150px', backgroundColor: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      No Image Available
                    </div>
                  )}
                  <div style={{ padding: '10px' }}>
                    <h3 style={{ fontSize: '16px' }}>{movie.title}</h3>
                    <p><strong>Language:</strong> {movie.language}</p>
                    <p><strong>Duration:</strong> {formatDuration(movie.duration)}</p>
                  </div>
                </Link>
              </div>
            ))}
          </motion.div>
          <button onClick={handleNext} style={{ marginLeft: '10px', backgroundColor: 'transparent', border: 'none', fontSize: '48px', color: 'grey', padding: '0' }}>&gt;</button>
          </div>
        </div>
      )}
      <Footer />
    </>
  );
}

export default HomePage;
