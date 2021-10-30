const fs = require('fs');
const _ = require('lodash');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const express = require('express');
const jwt = require('jsonwebtoken');

const app = express();

// Load Environment Variables
dotenv.config();

// Use Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/api', require('./routes/api/'));
