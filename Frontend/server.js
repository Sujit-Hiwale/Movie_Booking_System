import express from 'express';
import sequelize from './db.js';
import bodyParser from 'body-parser';

const app = express();
const port = 3001;

app.use(bodyParser.json());
sequelize.sync();

app.use((err, req, res, next) => {
    console.error('Error occurred:', err);
    res.status(500).send('Internal Server Error');
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});