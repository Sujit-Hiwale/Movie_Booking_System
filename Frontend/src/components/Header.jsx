import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Navbar, Nav, Container, Form, FormControl, Dropdown } from 'react-bootstrap';
import { FaUserCircle } from 'react-icons/fa';
import debounce from 'lodash/debounce';

function Header() {
  const [username, setUsername] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [movies, setMovies] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('http://localhost:8080/api/check_auth', { withCredentials: true })
      .then((response) => {
        if (response.data.authenticated) {
          setUsername(response.data.user.name);
        } else {
          setUsername(null);
        }
      })
      .catch((error) => {
        console.error('Error checking auth:', error);
      });
  }, []);

  const fetchMovies = useCallback(debounce((query) => {
    if (query) {
      axios.get(`http://localhost:8080/api/movies?query=${query}`)
        .then((response) => {
          // Filter movies based on consecutive characters
          const filteredMovies = response.data.filter(movie => 
            movie.title.toLowerCase().includes(query.toLowerCase()) ||
            movie.genre.toLowerCase().includes(query.toLowerCase())
          );
          setMovies(filteredMovies);
        })
        .catch((error) => {
          console.error('Error fetching search results:', error);
        });
    } else {
      setMovies([]);
    }
  }, 300), []);

  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchTerm(query);
    fetchMovies(query);
  };

  const handleResultClick = (movieId) => {
    setMovies([]);
    navigate(`/movies/${movieId}`);
  };

  const highlightText = (text, term) => {
    if (!term) return text;
    const regex = new RegExp(`(${term})`, 'gi');
    return text.replace(regex, '<strong>$1</strong>');
  };

  return (
    <Navbar bg="dark" variant="dark" fixed="top">
      <Container fluid>
        <Nav className="me-auto">
          <Navbar.Brand as={Link} to="/" className="text-white">
            Movie Booking System
          </Navbar.Brand>
        </Nav>
        <Form className="d-flex flex-grow-1 mx-5" onSubmit={(e) => e.preventDefault()}>
          <FormControl
            type="search"
            placeholder="Search Movies, Genres"
            className="me-2"
            aria-label="Search"
            value={searchTerm}
            onChange={handleSearch}
            style={{ width: '71%', marginLeft: '40px' }}
          />
        </Form>
        <Nav className="ms-auto">
          {username ? (
            <Dropdown align="end">
            <Dropdown.Toggle variant="link" id="profile-dropdown" className="text-white no-arrow">
              <FaUserCircle size={24} />
            </Dropdown.Toggle>
            <Dropdown.Menu style={{ backgroundColor: '#6c757d', borderColor: '#6c757d' }}>
              <Dropdown.Item as={Link} to={`/profile/${username}`}>
                Profile
              </Dropdown.Item>
              <Dropdown.Item as={Link} to="/user/reservation">
                My Reservation
              </Dropdown.Item>
              <Dropdown.Item onClick={() => {
                axios.post('http://localhost:8080/api/logout', {}, { withCredentials: true })
                  .then(() => {
                    setUsername(null);
                    navigate('/login');
                  })
                  .catch(error => console.error('Logout error:', error));
              }}>
                Logout
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
          ) : (
            <>
              <Nav.Link as={Link} to="/login">Login</Nav.Link>
              <Nav.Link as={Link} to="/signup">Sign Up</Nav.Link>
            </>
          )}
        </Nav>
      </Container>

      {movies.length > 0 && (
        <div style={{
          position: 'absolute',
          top: '80px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '50%',
          maxHeight: '300px',
          overflowY: 'auto',
          backgroundColor: '#343a40',
          border: '1px solid #ced4da',
          borderRadius: '5px',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
          zIndex: 1000,
          textAlign: 'left',
          padding: '10px',
          color: 'white',
        }}>
          {movies.map((movie) => (
            <div
              key={movie.id}
              style={{ padding: '10px', cursor: 'pointer' }}
              onClick={() => handleResultClick(movie.id)}
              dangerouslySetInnerHTML={{ __html: `<img src="${movie.image || 'placeholder-image-url'}" alt="${movie.title}" style="width: 50px; margin-right: 10px" /><strong>${highlightText(movie.title, searchTerm)}</strong> - <span>${highlightText(movie.genre, searchTerm)}</span>` }}
            />
          ))}
        </div>
      )}
    </Navbar>
  );
}

export default Header;
