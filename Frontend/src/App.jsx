import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import { UserProvider } from './components/UserContext';
import HomePage from './pages/HomePage';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Profile from './pages/Profile';
import LogoutPage from './pages/LogoutPage';
import MovieDetailsPage from './pages/MovieDetails';
import Theatres from './pages/Theatres';
import Showtimes from './pages/Showtime';
import Reservation from './pages/Reservation';
import Genre from './pages/Genre';
import Payment from './pages/Payment';
import Seats from './pages/Seats';
import UserReservations from './pages/UserReservation';
import AdminUsers from './pages/AdminUsers';
import AdminMovies from './pages/AdminMovies';
import AdminShowtime from './pages/AdminShowtime';
import AdminReservation from './pages/AdminReservation';
import AdminDashboard from './pages/AdminDashboard';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

function App() {
  return (
<>
      <style>
        {`
          body {
            background-color: #343a40;
            color: white;
            font-family: Arial, 'sans-serif';
            min-height: 100vh;
          }
        `}
      </style>
    <UserProvider>
    <Router>
       <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/profile/:username" element={<Profile />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/logout" element={<LogoutPage />} />
        <Route path="/movies/:id" element={<MovieDetailsPage />} />
        <Route path="/theatres" element={<Theatres />} />
        <Route path="/showtimes" element={<Showtimes />} />
        <Route path="/reservation" element={<Reservation />} />
        <Route path="/genres" element={<Genre />} />
        <Route path="/payment" element={<Payment />} />
        <Route path="/seats" element={<Seats />} />
        <Route path="/user/reservation" element={<UserReservations />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/movies" element={<AdminMovies />} />
        <Route path="/admin/showtimes" element={<AdminShowtime />} />
        <Route path="/admin/reservations" element={<AdminReservation />} />
        <Route path="/admin_dashboard" element={<AdminDashboard />} />
      </Routes>
    </Router>
    </UserProvider></>
  );
}

export default App;
