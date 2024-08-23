import {Sequelize, DataTypes} from 'sequelize';
import sequelize from '../db.js';

const Theatre = sequelize.define('Theatre',{
    id:{
        type: DataTypes.INTEGER,
        primaryKey:true,
        autoIncrement: true
    },
    name:{
        type:DataTypes.STRING,
        allowNull: false
    },
    city:{
        type: DataTypes.STRING  ,
        allowNull: false
    },
    ticket_price:{
        type: DataTypes.FLOAT,
        allowNull: false
    },
    seats:{
        type: DataTypes.TEXT
    },
    image:{
        type: DataTypes.STRING
    }
}, {
    tableName: 'theatre',
    timestamps: false
});

export default Theatre;