import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Header from '../components/Header.jsx';


function MovieDetails() {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [error, setError] = useState('');
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMovieDetails = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/movies', {
          withCredentials: true,
        });
        if (response.data) {
          const selectedMovie = response.data.find(movie => movie.id === parseInt(id));
          setMovie(selectedMovie);
        } else {
          setError('Movie not found');
        }
      } catch (error) {
        setError('Error fetching movie details');
        console.error('Error fetching movie details:', error);
      }
    };

    fetchMovieDetails();
  }, [id]);

  const getYouTubeEmbedUrl = (url) => {
    const videoId = getYouTubeVideoId(url);
    return videoId ? `https://www.youtube.com/embed/${videoId}` : '';
  };

  const getYouTubeVideoId = (url) => {
    const match = url.match(/(?:https?:\/\/)?(?:www\.)?youtu(?:be\.com\/(?:embed\/|v\/|watch\?v=)|\.be\/)([^"&?/ ]{11})/);
    return match ? match[1] : null;
  };

  if (error) {
    return <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>;
  }

  if (!movie) {
    return <p style={{ textAlign: 'center' }}>Loading...</p>;
  }

  const handleReserveClick = () => {
    navigate(`/reservation?movieId=${movie.id}`);
  };

  return (
    <>
    <Header />
    <div style={{ padding: '20px', marginTop: '60px' }}>
      <h2>{movie.title}</h2>
      <div style={{ display: 'flex', gap: '20px' }}>
        {movie.image && (
          <img src={movie.image} alt={movie.title} style={{ width: '100%', maxWidth:' 300px', height: 'auto', objectFit:'contain' }} />
        )}
        <div style={{ padding:'50px', textAlign: 'left' }}>
          <p><strong>Language:</strong> {movie.language}</p>
          <p><strong>Duration:</strong> {`${Math.floor(movie.duration / 60)}h ${movie.duration % 60}m`}</p>
          <p><strong>Genre:</strong> {movie.genre}</p>
          <p><strong>Director:</strong> {movie.director}</p>
          <p><strong>Description:</strong> {movie.description}</p>
          {movie.trailer && (
            <div>
            <h3>Trailer:</h3>
            {!isVideoLoaded ? (
              <div
                style={{
                  width: '640px',
                  height: '360px',
                  backgroundImage: `url('https://img.youtube.com/vi/${getYouTubeVideoId(movie.trailer)}/hqdefault.jpg')`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center center',
                  backgroundRepeat: 'no-repeat',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '8px',
                  overflow: 'hidden',
                }}
                onClick={() => setIsVideoLoaded(true)}
              >
                <button style={{ fontSize: '20px', padding: '10px 20px', backgroundColor: 'rgba(0,0,0,0.5)', color: 'white', border: 'none', borderRadius: '5px' }}>
                  Play Trailer
                </button>
              </div>
            ) : (
              <iframe
                width="640"
                height="360"
                src={getYouTubeEmbedUrl(movie.trailer)}
                title={movie.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
                style={{ borderRadius: '8px' }}
              ></iframe>
            )}
          </div>
          
          
          
          )}
        </div>
      </div>
      <div style={{ marginTop: '20px' }}>
  <button
    onClick={handleReserveClick}
    style={{
      padding: '10px 20px',
      backgroundColor: '#007bff',
      color: 'white',
      border: 'none',
      borderRadius: '5px',
      cursor: 'pointer',
    }}
  >
    Reserve Tickets
  </button>
</div>
    </div>
    </>
  );
}

export default MovieDetails;
