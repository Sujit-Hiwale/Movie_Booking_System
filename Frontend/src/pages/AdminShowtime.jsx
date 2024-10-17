import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdminShowtime = () => {
    const [showtimes, setShowtimes] = useState([]);
    const [movies, setMovies] = useState([]);
    const [theatres, setTheatres] = useState([]);
    const [forms, setForms] = useState([
        {
            movie_id: '',
            theatre_id: '',
            ticket_price: '',
            start_date: '',
            end_date: ''
        }
    ]);
    const [selectedShowtime, setSelectedShowtime] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showAddForm, setShowAddForm] = useState(false);

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
                console.error('Failed to fetch data:', error);
                setError('Failed to fetch data');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleFormChange = (index, e) => {
        const updatedForms = [...forms];
        updatedForms[index][e.target.name] = e.target.value;
        setForms(updatedForms);
    };

    const handleAddForm = () => {
        setForms([
            ...forms,
            {
                movie_id: '',
                theatre_id: '',
                ticket_price: '',
                start_date: '',
                end_date: ''
            }
        ]);
    };

    const handleRemoveForm = (index) => {
        const updatedForms = forms.filter((_, i) => i !== index);
        setForms(updatedForms);
    };

    const handleCreate = async () => {
        try {
            await axios.post('http://localhost:8080/api/showtime', { showtimes: forms });
            setForms([{
                movie_id: '',
                theatre_id: '',
                ticket_price: '',
                start_date: '',
                end_date: ''
            }]);
            const response = await axios.get('http://localhost:8080/api/showtime');
            setShowtimes(response.data);
        } catch (error) {
            console.error('Failed to create showtime(s):', error);
            setError('Failed to create showtime(s)');
        }
    };

    const handleUpdate = async () => {
        if (selectedShowtime) {
            try {
                await axios.put(`http://localhost:8080/api/showtime/${selectedShowtime.id}`, forms[0]);
                setForms([{
                    movie_id: '',
                    theatre_id: '',
                    ticket_price: '',
                    start_date: '',
                    end_date: ''
                }]);
                setSelectedShowtime(null);
                const response = await axios.get('http://localhost:8080/api/showtime');
                setShowtimes(response.data);
            } catch (error) {
                console.error('Failed to update showtime:', error);
                setError('Failed to update showtime');
            }
        }
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`http://localhost:8080/api/showtime/${id}`);
            const response = await axios.get('http://localhost:8080/api/showtime');
            setShowtimes(response.data);
        } catch (error) {
            console.error('Failed to delete showtime:', error);
            setError('Failed to delete showtime');
        }
    };

    const toggleAddForm = () => {
        setShowAddForm(prevState => !prevState);
    };

    if (loading) return <p>Loading...</p>;
    if (error) return <p>{error}</p>;

    return (
        <div style={{ padding: '20px' }}>
            <h1>Admin Showtimes</h1>
            <button onClick={toggleAddForm}>
                {showAddForm ? 'Hide Add Showtime Form' : 'Add Showtime(s)'}
            </button>

            {showAddForm && (
                <>
                    <h2>Create Showtime(s)</h2>
                    {forms.map((form, index) => (
                        <div key={index} style={{ marginBottom: '20px' }}>
                            <form>
                                <label>
                                    Movie:
                                    <select name="movie_id" value={form.movie_id} onChange={(e) => handleFormChange(index, e)}>
                                        <option value="">Select Movie</option>
                                        {movies.map(movie => (
                                            <option key={movie.id} value={movie.id}>{movie.title}</option>
                                        ))}
                                    </select>
                                </label>
                                <label>
                                    Theatre:
                                    <select name="theatre_id" value={form.theatre_id} onChange={(e) => handleFormChange(index, e)}>
                                        <option value="">Select Theatre</option>
                                        {theatres.map(theatre => (
                                            <option key={theatre.id} value={theatre.id}>{theatre.name}</option>
                                        ))}
                                    </select>
                                </label>
                                <label>
                                    Ticket Price:
                                    <input type="number" name="ticket_price" value={form.ticket_price} onChange={(e) => handleFormChange(index, e)} />
                                </label>
                                <label>
                                    Start Date:
                                    <input type="date" name="start_date" value={form.start_date} onChange={(e) => handleFormChange(index, e)} />
                                </label>
                                <label>
                                    End Date:
                                    <input type="date" name="end_date" value={form.end_date} onChange={(e) => handleFormChange(index, e)} />
                                </label>
                            </form>
                            {forms.length > 1 && (
                                <button type="button" onClick={() => handleRemoveForm(index)}>Remove</button>
                            )}
                        </div>
                    ))}
                    <button type="button" onClick={handleAddForm}>Add Another Showtime</button>
                    <button type="button" onClick={handleCreate}>Submit Showtimes</button>
                </>
            )}

            <h2>Showtimes List</h2>
            {showtimes.map(showtime => (
                <div key={showtime.id} style={{ marginBottom: '20px', border: '1px solid #ddd', padding: '10px' }}>
                    <div><strong>Movie:</strong> {movies.find(m => m.id === showtime.movie_id)?.title || 'Unknown Movie'}</div>
                    <div><strong>Theatre:</strong> {theatres.find(t => t.id === showtime.theatre_id)?.name || 'Unknown Theatre'}</div>
                    <div><strong>Ticket Price:</strong> ${showtime.ticket_price}</div>
                    <div><strong>Start Date:</strong> {new Date(showtime.start_date).toLocaleDateString()}</div>
                    <div><strong>End Date:</strong> {new Date(showtime.end_date).toLocaleDateString()}</div>
                    <button onClick={() => {
                        setSelectedShowtime(showtime);
                        setForms([{
                            movie_id: showtime.movie_id,
                            theatre_id: showtime.theatre_id,
                            ticket_price: showtime.ticket_price,
                            start_date: showtime.start_date,
                            end_date: showtime.end_date
                        }]);
                    }}>Edit</button>
                    <button onClick={() => handleDelete(showtime.id)}>Delete</button>
                </div>
            ))}

            {selectedShowtime && (
                <div>
                    <h2>Edit Showtime</h2>
                    <form>
                        <label>
                            Movie:
                            <select name="movie_id" value={forms[0].movie_id} onChange={(e) => handleFormChange(0, e)}>
                                <option value="">Select Movie</option>
                                {movies.map(movie => (
                                    <option key={movie.id} value={movie.id}>{movie.title}</option>
                                ))}
                            </select>
                        </label>
                        <label>
                            Theatre:
                            <select name="theatre_id" value={forms[0].theatre_id} onChange={(e) => handleFormChange(0, e)}>
                                <option value="">Select Theatre</option>
                                {theatres.map(theatre => (
                                    <option key={theatre.id} value={theatre.id}>{theatre.name}</option>
                                ))}
                            </select>
                        </label>
                        <label>
                            Ticket Price:
                            <input type="number" name="ticket_price" value={forms[0].ticket_price} onChange={(e) => handleFormChange(0, e)} />
                        </label>
                        <label>
                            Start Date:
                            <input type="date" name="start_date" value={forms[0].start_date} onChange={(e) => handleFormChange(0, e)} />
                        </label>
                        <label>
                            End Date:
                            <input type="date" name="end_date" value={forms[0].end_date} onChange={(e) => handleFormChange(0, e)} />
                        </label>
                    </form>
                    <button onClick={handleUpdate}>Update Showtime</button>
                    <button onClick={() => setSelectedShowtime(null)}>Cancel</button>
                </div>
            )}
        </div>
    );
};

export default AdminShowtime;
