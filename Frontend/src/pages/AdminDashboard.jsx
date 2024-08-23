import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, BarChart, Bar, PieChart, Cell, Pie } from 'recharts';
import { Container, Row, Col, Card } from 'react-bootstrap';
import Header from '../components/Header.jsx';

const CustomTooltip = ({ payload, label, active }) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip">
      <p className="label">{`Date: ${label}`}</p>
      <p className="intro">{`Bookings: ${payload[0].value}`}</p>
      </div>
    );
  }

  return null;
};

const CustomBarTooltip = ({ payload, label, active }) => {
  if (active && payload && payload.length) {
    // Format the value with a $ sign
    const formattedValue = `$${payload[0].value.toFixed(2)}`;
    
    return (
      <div className="custom-tooltip">
        <p className="label">{`Movie: ${label}`}</p>
        <p className="intro">{`Revenue: ${formattedValue}`}</p>
      </div>
    );
  }

  return null;
};


const AdminDashboard = () => {
  const [summary, setSummary] = useState({
    users: 0,
    reservations: 0,
    showtimes: 0,
    theatres: 0,
  });
  const [bookingData, setBookingData] = useState([]);
  const [revenueData, setRevenueData] = useState([]);
  const [genreDistribution, setGenreDistribution] = useState([]);
  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#a4de6c', '#d0ed57'];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const usersResponse = await axios.get('http://localhost:8080/api/users');
        const userCount = usersResponse.data.users.length;

        const reservationsResponse = await axios.get('http://localhost:8080/api/reservation');
        const reservations = reservationsResponse.data;

        const showtimesResponse = await axios.get('http://localhost:8080/api/showtime');
        const showtimes = showtimesResponse.data;

        const theatresResponse = await axios.get('http://localhost:8080/api/theatres');
        const theatreCount = theatresResponse.data.length;

        const moviesResponse = await axios.get('http://localhost:8080/api/movies');
        const movies = moviesResponse.data;

        setSummary({
          users: userCount,
          reservations: reservations.length,
          showtimes: showtimes.length,
          theatres: theatreCount,
        });
        const dates = reservations.map(res => new Date(res.date));
        const firstDate = new Date(Math.min(...dates));
        const lastDate = new Date(Math.max(...dates));
    
        // Create an array of all dates between the first and last
        const allDates = [];
        for (let d = firstDate; d <= lastDate; d.setDate(d.getDate() + 1)) {
          allDates.push(new Date(d).toLocaleDateString('en-US', { day: '2-digit', month: 'short' }));
        }
    
        // Aggregate bookings by date
        const bookingsByDate = reservations.reduce((acc, res) => {
          const date = new Date(res.date).toLocaleDateString('en-US', { day: '2-digit', month: 'short' });
          acc[date] = (acc[date] || 0) + 1;
          return acc;
        }, {});
    
        // Ensure all dates are present in the data
        const sortedBookingData = allDates.map(date => ({
          name: date,
          bookings: bookingsByDate[date] || 0,
        }));
      setBookingData(sortedBookingData);

        const revenueByMovie = showtimes.reduce((acc, showtime) => {
  const movie = movies.find(m => m.title === showtime.movie_title);
  if (movie) {
    acc[movie.title] = acc[movie.title] || 0;

    // Accumulate revenue from all reservations for this showtime
    reservations.forEach(reservation => {
      if (reservation.showtime_id === showtime.id) {
        acc[movie.title] += reservation.seats * showtime.ticket_price;
      }
    });
  }
  return acc;
}, {});

        setRevenueData(Object.entries(revenueByMovie).map(([movie, revenue]) => ({ name: movie, revenue })));

        const genreCount = {};
        movies.forEach(movie => {
          const genres = movie.genre.split(',').map(genre => genre.trim());
          genres.forEach(genre => {
            genreCount[genre] = genreCount[genre] || 0;
            genreCount[genre] += 1;
          });
        });
        setGenreDistribution(Object.entries(genreCount).map(([genre, count]) => ({ name: genre, value: count })));

      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);


  return (
    <Container fluid>
      <Header />
      <Row>
        <Col md={12} className="p-3 bg-muted text-light">
          <nav className="d-flex justify-content-around mt-4">
            <Link
              to="/admin/movies"
              className="nav-link text-primary"
              style={{ textDecoration: 'none' }}
            >
              Movies
            </Link>
            <Link
              to="/admin/showtimes"
              className="nav-link text-primary"
              style={{ textDecoration: 'none' }}
            >
              Showtimes
            </Link>
            <Link
              to="/admin/reservations"
              className="nav-link text-primary"
              style={{ textDecoration: 'none' }}
            >
              Reservations
            </Link>
            <Link
              to="/admin/users"
              className="nav-link text-primary"
              style={{ textDecoration: 'none' }}
            >
              Users
            </Link>
          </nav>
        </Col>
      </Row>
      <Row className="mt-4">
        <Col md={4} className="p-4">
          <h2>Dashboard Summary</h2>
          <Row className="mb-4">
            {Object.entries(summary).map(([key, value]) => (
              <Col md={12} key={key} className="mb-3">
                <Card className='bg-dark text-light'>
                  <Card.Body>
                    <Card.Title>{key.charAt(0).toUpperCase() + key.slice(1)}</Card.Title>
                    <Card.Text>{value}</Card.Text>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Col>
        <Col md={8} className="p-4">
          <h2>Booking Trends</h2>
          {bookingData.length > 0 ? (
            <LineChart width={600} height={300} data={bookingData} className="mb-4" >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tickFormatter={(date) => {
                const options = { day: '2-digit', month: 'short' };
                const [day, month] = new Date(date).toLocaleDateString(undefined, options).split(' ');
                return `${day} ${month}`;
            }} />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line type="monotone" dataKey="bookings" stroke="#8884d8" strokeWidth={3} />
            </LineChart>
          ) : <p>No booking data available</p>}
          <h2>Revenue by Movie</h2>
          {revenueData.length > 0 ? (
            <BarChart width={750} height={300} data={revenueData} className="mb-4">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis />
              <Tooltip content={<CustomBarTooltip />} />
              <Legend />
              <Bar dataKey="revenue" fill="#82ca9d" />
            </BarChart>
          ) : <p>No revenue data available</p>}
          <h2>Genre Distribution</h2>
{genreDistribution.length > 0 ? (
  <PieChart width={610} height={400} className="mb-4">
    <Pie
      data={genreDistribution}
      dataKey="value"
      nameKey="name"
      cx="50%"
      cy="50%"
      outerRadius={150}
      fill="#8884d8"
      labelLine={false}
      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
    >
      {genreDistribution.map((entry, index) => (
        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
      ))}
    </Pie>
    <Tooltip />
  </PieChart>
) : <p>No genre distribution data available</p>}
        </Col>
      </Row>
    </Container>
  );
  
};

export default AdminDashboard;
