import {Sequelize, DataTypes} from 'sequelize';
import sequelize from '../db.js';

const Reservation = sequelize.define('Reservation',{
    id:{
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    user_id:{
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model:'user',
            key: 'id'
        }
    },
    showtime_id:{
        type: DataTypes.INTEGER,
        allowNull: false,
        references:{
            model:'Showtime',
            key:'id'
        }
    },
    order_id:{
        type: DataTypes.INTEGER,
        allowNull:false,
        unique: true
    },
    date:{
        type: DataTypes.DATE,
        allowNull:false
    },
    start_at:{
        type: DataTypes.TIME,
        allowNull:false
    },
    seats:{
        type: DataTypes.INTEGER,
        allowNull: false
    },
    ticket_price:{
        type: DataTypes.INTEGER,
        allowNull: false
    },
    total:{
        type: DataTypes.FLOAT,
        allowNull: false
    },
    name:{
        type: DataTypes.STRING,
        allowNull: false
    },
    phone:{
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    tableName: 'reservation',
    timestamps: false
});

export default Reservation;