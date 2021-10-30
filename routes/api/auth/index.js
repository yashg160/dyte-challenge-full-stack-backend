const _ = require('lodash');
const bcrypt = require('bcrypt');
const express = require('express');

const sequelize = require('../../../sequelize');
const { handleTokenAuth } = require('../../../middleware/auth');

const router = express.Router();

// POST Sign Up Route
router.post('/register', async (req, res, next) => {
  const { name, email, password } = req.body;

  // Basic validation
  if (_.isNil(name) || _.isNil(email) || _.isNil(password)) {
    return res.status(400).json({
      message: 'Required values were missing. Please try again',
    });
  }

  try {
    const sql1 = `SELECT * FROM users WHERE email='${email}';`;

    const [result1, metadata1] = await sequelize.query(sql1);

    if (result1.length !== 0) {
      return res.status(409).json({
        message: 'Account with this email already exists',
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Store user in db
    const sql2 = `INSERT INTO users (name,email, password) VALUES ('${name}, ${email}', '${hashedPassword}');`;

    const [result2, metadata2] = await sequelize.query(sql2);

    // Send token TODO

    return res.status(200).json({
      message: ' You are successfully registered',
    });
  } catch (err) {
    console.error('Register API Error', err);
    return res.status(500).json({
      message: 'A server error occurred',
    });
  }
});

// POST Sign In Route
router.post('/login', async (req, res, next) => {
  const { email, password } = req.body;

  // Basic validation
  if (_.isNil(email) || _.isNil(password)) {
    return res.status(400).json({
      message: 'Required values were missing. Please try again',
    });
  }

  try {
    // Get user from DB
    const sql = `SELECT * FROM users WHERE email='${email}';`;

    const [result, metadata] = await sequelize.query(sql);

    if (result.length === 1) {
      const isAuthorized = await bcrypt.compare(password, result[0].password);

      if (isAuthorized) {
        // Send token TODO
        return res.status(200).json({
          message: 'You are successfully signed in',
        });
      } else {
        return res.status(401).json({
          message: 'You are not authorized to access this account',
        });
      }
    } else {
      return res.status(403).json({
        message: 'You are not authorized to access this account',
      });
    }
  } catch (err) {
    console.error('Login API Error', err);
    return res.status(500).json({
      message: 'A server error occurred',
    });
  }
});

// GET User Data Route
router.get('/user', handleTokenAuth, async (req, res, next) => {});

module.exports = router;
