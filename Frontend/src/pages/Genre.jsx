import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Row, Col, Form, Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

function Genre() {
  const [genres, setGenres] = useState([]);
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [allMovies, setAllMovies] = useState([]);
  const [filteredMovies, setFilteredMovies] = useState([]);
  const [filterMode, setFilterMode] = useState('any');

  useEffect(() => {
    axios.get('http://localhost:8080/api/movies')
      .then(response => {
        const movies = response.data;
        setAllMovies(movies);

        const genreSet = new Set();
        movies.forEach(movie => {
          const movieGenres = movie.genre.split(',');
          movieGenres.forEach(genre => genreSet.add(genre.trim()));
        });

        const sortedGenres = Array.from(genreSet).sort((a, b) => a.localeCompare(b));
        setGenres(sortedGenres);
      })
      .catch(error => {
        console.error('Error fetching movies:', error);
      });
  }, []);

  useEffect(() => {
    if (selectedGenres.length === 0) {
      setFilteredMovies([]);
    } else {
      const filtered = allMovies.filter(movie => {
        const movieGenres = movie.genre.split(',').map(g => g.trim());
        if (filterMode === 'any') {
          return selectedGenres.some(genre => movieGenres.includes(genre));
        } else {
          return selectedGenres.every(genre => movieGenres.includes(genre));
        }
      });
      setFilteredMovies(filtered);
    }
  }, [selectedGenres, allMovies, filterMode]);

  const handleGenreChange = (genre) => {
    setSelectedGenres(prevSelected =>
      prevSelected.includes(genre)
        ? prevSelected.filter(g => g !== genre)
        : [...prevSelected, genre]
    );
  };

  const handleFilterModeChange = (event) => {
    setFilterMode(event.target.value);
  };

  return (
    <Container className="mt-5 pt-4">
      <Row>
        <Col md={3}>
        <div style={{
            position: 'absolute',
            top: '0',
            left: '0',
            padding: '15px',
            boxShadow: '0 2px 5px rgba(0,0,0,0.1)', // Optional: adds a shadow to make it stand out
          }}>
          <h4>Filter by Genres</h4>
          <Form>
            <Form.Group controlId="filterMode">
              <Form.Control 
                as="select" 
                value={filterMode} 
                onChange={handleFilterModeChange}
                style={{ width: 'auto' }}
              >
                <option value="any">Any Selected</option>
                <option value="all">All Selected</option>
              </Form.Control>
            </Form.Group>
            <Form.Group className="mt-3">
              {genres.map(genre => (
                <Form.Check
                  key={genre}
                  type="checkbox"
                  id={`genre-${genre}`}
                  label={genre}
                  checked={selectedGenres.includes(genre)}
                  onChange={() => handleGenreChange(genre)}
                />
              ))}
            </Form.Group>
          </Form></div>
        </Col>
        <Col md={9} style={{ marginLeft: '250px' }}>
          <h4>Movies</h4>
          <Row className="g-3">
            {filteredMovies.length > 0 ? (
              filteredMovies.map(movie => (
                <Col key={movie.id} md={4} className="d-flex"  style={{ minWidth: '250px' }}>
                  <Card className='bg-dark text-light'>
                    <Card.Img variant="top" src={movie.image || 'placeholder-image-url'} />
                    <Card.Body className="d-flex flex-column" style={{ flexGrow: 1 }}>
                      <Card.Title>{movie.title}</Card.Title>
                      <Card.Text>{movie.genre}</Card.Text>
                      <Link to={`/movies/${movie.id}`} className="btn btn-primary mt-auto">View Details</Link>
                    </Card.Body>
                  </Card>
                </Col>
              ))
            ) : (
              <Col>
                <p>No movies found for the selected genres.</p>
              </Col>
            )}
          </Row>
        </Col>
      </Row>
    </Container>
  );
}

export default Genre;
