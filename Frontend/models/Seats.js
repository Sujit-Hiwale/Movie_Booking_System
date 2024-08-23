import { Sequelize, DataTypes } from 'sequelize';
import sequelize from '../db.js';

const Seat = sequelize.define('Seat', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    theatre_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Theatres',
            key: 'id'
        }
    },
    date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
    },
    time: {
        type: DataTypes.TIME,
        allowNull: false,
    },
    row: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    seat_number: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    reserved: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    user_id: {
        type: DataTypes.INTEGER,
        // optional, if you want to track the user who reserved the seat
    }
}, {
    tableName: 'seats',
    timestamps: false
});

export default Seat;