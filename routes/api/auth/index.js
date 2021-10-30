const _ = require('lodash');
const bcrypt = require('bcrypt');
const express = require('express');
const jwt = require('jsonwebtoken');

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
    const sql1 = `SELECT * FROM users WHERE email='${email.trim()}';`;

    const [result1, metadata1] = await sequelize.query(sql1);

    if (result1.length !== 0) {
      return res.status(409).json({
        message: 'Account with this email already exists',
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Store user in db
    const sql2 = `INSERT INTO users (name, email, password) VALUES ('${name.trim()}', '${email.trim()}', '${hashedPassword}');`;

    const [result2, metadata2] = await sequelize.query(sql2);

    // Send token TODO
    const tokenDataPayload = {
      name: name.trim(),
      id: result2, // Database ID of the user
    };

    const signedToken = await jwt.sign(
      tokenDataPayload,
      process.env.JWT_SECRET,
      {
        expiresIn: '7d',
      }
    );

    return res.status(200).json({
      token: signedToken,
      message: 'You are successfully registered',
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
    const sql = `SELECT * FROM users WHERE email='${email.trim()}';`;

    const [result, metadata] = await sequelize.query(sql);

    if (result.length === 1) {
      const isAuthorized = await bcrypt.compare(password, result[0].password);

      const tokenDataPayload = {
        name: result[0].name,
        id: result[0].id, // Database ID of the user
      };

      const signedToken = await jwt.sign(
        tokenDataPayload,
        process.env.JWT_SECRET,
        {
          expiresIn: '7d',
        }
      );

      if (isAuthorized) {
        // Send token TODO
        return res.status(200).json({
          token: signedToken,
          message: 'You are successfully signed in',
        });
      } else {
        return res.status(401).json({
          message: 'You are not authorized to access this account',
        });
      }
    } else if (result.length === 0) {
      return res.status(404).json({
        message: 'No user with that email was found. Please login',
      });
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
router.get('/user', handleTokenAuth, async (req, res, next) => {
  if (_.has(res.locals, 'dataPayload')) {
    // Data payload contains decoded token, which has the database ID and name of the user
    const { dataPayload } = res.locals;

    const sql = `SELECT * FROM users WHERE id=${dataPayload.id};`;

    const [result, metadata] = await sequelize.query(sql);

    if (result.length === 1) {
      const user = result[0];

      return res.status(200).json({
        message: 'Got user data',
        data: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      });
    } else {
      return res.status(401).json({
        message: 'You are not authorized to access this account',
      });
    }
  } else
    return res.status(500).json({
      message: 'A server error occurred. Please try again.',
    });
});

module.exports = router;
