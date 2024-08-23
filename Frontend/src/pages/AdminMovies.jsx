import React, { useState, useEffect } from 'react';
import axios from 'axios';

function AdminMovies() {
  const [movies, setMovies] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [duration, setDuration] = useState('');

  useEffect(() => {
    fetchMovies();
  }, []);

  const fetchMovies = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/movies');
      setMovies(response.data);
    } catch (error) {
      console.error('Error fetching movies:', error);
    }
  };

  const handleAddMovie = () => {
    setSelectedMovie(null);
    setDuration('');
    setShowAddForm(true);
  };

  const handleEditMovie = (movie) => {
    setSelectedMovie(movie);
    setDuration(movie.duration);
    setShowAddForm(true);
  };

  const handleDeleteMovie = async (movieId) => {
    try {
      await axios.delete(`http://localhost:8080/api/movies/${movieId}`);
      fetchMovies(); // Refresh the movie list after deletion
    } catch (error) {
      console.error('Error deleting movie:', error);
    }
  };

  const handleFormSubmit = async (event) => {
    event.preventDefault();

    const movieData = {
      title: event.target.title.value,
      image: event.target.image.value,
      language: event.target.language.value,
      genre: event.target.genre.value,
      director: event.target.director.value,
      trailer: event.target.trailer.value,
      description: event.target.description.value,
      duration: parseInt(duration),
      start_date: event.target.start_date.value,
      end_date: event.target.end_date.value,
    };

    try {
      if (selectedMovie) {
        await axios.put(`http://localhost:8080/api/movies/${selectedMovie.id}`, movieData);
      } else {
        await axios.post('http://localhost:8080/api/movies', movieData);
      }
      setShowAddForm(false);
      fetchMovies(); // Refresh the movie list after adding or updating
    } catch (error) {
      console.error('Error saving movie:', error);
    }
  };

  return (
    <div>
      <h1>Admin Movies</h1>
      <div>
        <button onClick={handleAddMovie}>Add Movie</button>
      </div>
      {showAddForm && (
        <form onSubmit={handleFormSubmit}>
          <input type="text" name="title" placeholder="Title" defaultValue={selectedMovie?.title || ''} />
          <input type="text" name="image" placeholder="Image URL" defaultValue={selectedMovie?.image || ''} />
          <input type="text" name="language" placeholder="Language" defaultValue={selectedMovie?.language || ''} />
          <input type="text" name="genre" placeholder="Genre" defaultValue={selectedMovie?.genre || ''} />
          <input type="text" name="director" placeholder="Director" defaultValue={selectedMovie?.director || ''} />
          <input type="text" name="trailer" placeholder="Trailer URL" defaultValue={selectedMovie?.trailer || ''} />
          <input type="text" name="description" placeholder="Description" defaultValue={selectedMovie?.description || ''} />
          <input type="number" name="duration" placeholder="Duration in minutes" min="0" value={duration} onChange={(e) => setDuration(e.target.value)} />
          
          <input type="date" name="start_date" placeholder="Start Date" defaultValue={selectedMovie?.start_date || ''} />
          <input type="date" name="end_date" placeholder="End Date" defaultValue={selectedMovie?.end_date || ''} />
          <button type="submit">{selectedMovie ? 'Update Movie' : 'Add Movie'}</button>
        </form>
      )}
      <div>
        {movies.map(movie => (
          <div key={movie.id}>
            <h3>{movie.title}</h3>
            <button onClick={() => handleEditMovie(movie)}>Edit</button>
            <button onClick={() => handleDeleteMovie(movie.id)}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AdminMovies;
