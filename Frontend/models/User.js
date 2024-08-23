import {Sequelize, DataTypes} from 'sequelize';
import sequelize from '../db.js';

const User = sequelize.define('User',{
    id:{
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement:true
    },
    name:{
        type: DataTypes.STRING,
        allowNull: false
    },
    email:{
        type: DataTypes.STRING,
        allowNull: false,
        unique:true
    },
    password:{
        type: DataTypes.STRING,
        allowNull: false
    },
    phone:{
        type: DataTypes.STRING
    },
    role:{
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue:'Customer'
    }
}, {
    tableName: 'user',
    timestamps:false
});

User.beforeSave(async (user, options) => {
    if (user.changed('password')) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
    }
    console.log(`About to save User: ${user.name}`);
});

export default User;