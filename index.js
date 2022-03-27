require('dotenv').config();

const express = require('express');
const cors = require('cors');
const routes = require('./routes/routes');
const mongoose = require('mongoose');
const mongoString = process.env.DATABASE_URL;

mongoose.connect(mongoString);
const database = mongoose.connection;

database.on('error', (error) => {
    console.log(error)
})

database.once('connected', () => {
    console.log('Database Connected');
})
const app = express();

app.use(cors()); //planning to store auth token in javascript accessible place instead of cookies. If I switch to cookies, I need to restrict the CORS to prevent CSRF.
app.use(express.json());
app.use('/', routes);

app.listen(3000, () => {
    console.log(`Server Started at ${process.env.PORT}`)
})