const _ = require('lodash');
const bcrypt = require('bcrypt');
const express = require('express');
const jwt = require('jsonwebtoken');
const randomstring = require('randomstring');

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

router.post('/', async (req, res, next) => {
  try {
    let errors = [];

    if (!_.has(req.body, 'sourceURL'))
      errors.push('Source URL is a required field');
    if (
      !/(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g.test(
        req.body.sourceURL
      )
    )
      errors.push('Source URL should be of a valid format');

    if (errors.length !== 0) {
      return res.status(400).json({
        message: 'Errors were found with the data',
        errors: errors,
      });
    }

    // Generate random string of length 10 to use as slug
    const generatedSlug = randomstring.generate(10);

    try {
      const sql1 = `INSERT INTO links (user_id, source, slug) VALUES (${res.locals.dataPayload.id}, '${req.body.sourceURL}', '${generatedSlug}');`;

      const [[r1, m1]] = await Promise.all([sequelize.query(sql1)]);

      return res.status(200).json({
        data: {
          id: r1,
          slug: generatedSlug,
          source: req.body.sourceURL,
        },
        message: 'Created new link',
      });
    } catch (err) {
      console.log('Link Creating Error', err);
      return res.status(500).json({
        message: 'A server error occurred. Try again later',
      });
    }
  } catch (err) {
    console.log('Link Creating Error', err);
    return res.status(500).json({
      message: 'A server error occurred. Try again later',
    });
  }
});

module.exports = router;
