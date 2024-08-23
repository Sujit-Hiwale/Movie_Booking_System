import {Sequelize} from 'sequelize';

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './Database/database.sqlite'  
});

export default sequelize;
