const _ = require('lodash');
const express = require('express');
const sequelize = require('../../../sequelize');

const router = express.Router();

// Get Data for Redirecting User to Source URL
router.get('/', async (req, res, next) => {
  try {
    // Redirection always happens using the slug
    if (_.has(req.query, 'slug')) {
      const sql1 = `SELECT source, (
            CASE
                WHEN is_expire_type = 0 OR expire_time IS NULL THEN FALSE
                WHEN is_expire_type = 1 AND expire_time IS NOT NULL AND current_timestamp() > expire_time THEN FALSE
                ELSE TRUE
            END
        ) AS is_expired FROM links WHERE slug='${req.query.slug}';`;

      const [[r1, m1]] = await Promise.all([sequelize.query(sql1)]);

      return res.status(200).json({
        data: r1,
        message: 'Retrieved data',
      });
    } else {
      return res.status(400).json({
        message: 'URL slug was npot provided',
      });
    }
  } catch (err) {
    return res.status(500).json({
      message: 'A server error occurred. Try again later',
    });
  }
});

module.exports = router;
