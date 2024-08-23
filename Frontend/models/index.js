import sequelize from '../db.js';

import User from'./User.js';
import Movie from './Movie.js';
import Theatre from './Theatre.js';
import Showtime from './Showtime.js';
import Reservation from './Reservation.js';
import Seat from './Seats.js'; // Adjust the import path as needed

User.hasMany(Reservation,{foreignKey:'user_id',sourceKey:'id'});
Reservation.belongsTo(User,{foreignKey:'user_id',targetKey:'id'});

Movie.hasMany(Showtime,{foreignKey:'movie_id',sourceKey:'id'});
Showtime.belongsTo(Movie,{foreignKey:'movie_id',targetKey:'id'});

Theatre.hasMany(Showtime,{foreignKey:'theatre_id',sourceKey:'id'});
Showtime.belongsTo(Theatre,{foreignKey:'theatre_id',targetKey:'id'});

Showtime.hasMany(Reservation,{foreignKey:'showtime_id',sourceKey:'id'});
Reservation.belongsTo(Showtime,{foreignKey:'showtime_id',targetKey:'id'});

User.hasMany(Seat, { foreignKey: 'user_id' });
Seat.belongsTo(User, { foreignKey: 'user_id' });

Theatre.hasMany(Seat, { foreignKey: 'theatre_id' });
Seat.belongsTo(Theatre, { foreignKey: 'theatre_id' });

export default {sequelize,User,Movie,Theatre,Showtime,Reservation};