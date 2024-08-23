import {Sequelize, DataTypes} from 'sequelize';
import sequelize from '../db.js';

const Movie = sequelize.define('Movie',{
    id:{
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    title:{
        type: DataTypes.STRING,
        allowNull: false
    },
    image:{
        type: DataTypes.STRING
    },
    language:{
        type: DataTypes.STRING
    },
    genre:{
        type: DataTypes.STRING
    },
    director:{
        type: DataTypes.STRING
    },
    trailer:{
        type: DataTypes.STRING
    },
    description:{
        type: DataTypes.STRING
    },
    duration:{
        type:DataTypes.INTEGER
    },
    start_date:{
        type: DataTypes.DATEONLY
    },
    end_date:{
        type: DataTypes.DATEONLY
    }
}, {
    tableName: 'movie',
    timestamps:false
});

export default Movie;