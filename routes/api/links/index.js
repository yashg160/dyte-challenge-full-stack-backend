const _ = require('lodash');
const bcrypt = require('bcrypt');
const express = require('express');
const jwt = require('jsonwebtoken');

const sequelize = require('../../../sequelize');

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    // Get all links for this user
    const sql1 = `SELECT *, (
                        CASE
                            WHEN is_expire_type = 1 AND current_timestamp() > expire_time THEN FALSE
                            ELSE TRUE
                        END
                    ) AS is_expired FROM links WHERE user_id=${res.locals.dataPayload.id};`;

    const [[r1, m1]] = await Promise.all([sequelize.query(sql1)]);

    return res.status(200).json({
      data: {
        links: r1,
      },
      message: 'Retrieved data',
    });
  } catch (err) {
    console.log('Link Data Fetching Error', err);
    return res.status(500).json({
      message: 'A server error occurred. Try again later',
    });
  }
});

module.exports = router;
