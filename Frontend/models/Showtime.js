import {Sequelize, DataTypes} from 'sequelize';
import sequelize from '../db.js';

const Showtime = sequelize.define('Showtime',{
    id:{
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    movie_id:{
        type: DataTypes.INTEGER,
        allowNull: false,
        references:{
            model: 'movie',
            key: 'id'
        }
    },
    theatre_id:{
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'theatre',
            key: 'id'
        }
    },
    ticket_price:{
        type: DataTypes.FLOAT,
        allowNull: false
    },
    start_date:{
        type: DataTypes.DATE
    },
    end_date:{
        type: DataTypes.DATE
    }
}, {
    tableName: 'showtime',
    timestamps: false
});

export default Showtime;