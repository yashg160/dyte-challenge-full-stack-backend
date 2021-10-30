const cors = require('cors');
const dotenv = require('dotenv');
const express = require('express');

const app = express();

// Load Environment Variables
dotenv.config();

// Use Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/api', require('./routes/api/'));

module.exports = app;
