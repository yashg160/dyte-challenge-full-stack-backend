const _ = require('lodash');
const bcrypt = require('bcrypt');
const express = require('express');
const jwt = require('jsonwebtoken');

const sequelize = require('../../../sequelize');

const router = express.Router();

router.get('/analytics', async (req, res, next) => {
  try {
    // Get total link clicks for this user
    const sql1 = `SELECT SUM(clicks) AS totalClicks FROM links WHERE user_id=${res.locals.dataPayload.id};`;

    // Get Link that has maximum clicks
    const sql2 = `SELECT * FROM links WHERE user_id=${res.locals.dataPayload.id} AND clicks = (SELECT MAX(clicks) FROM links);`;

    // Get total number of active links
    const sql3 = `SELECT COUNT(*) AS totalActiveLinks FROM links WHERE user_id=${res.locals.dataPayload.id} 
                    AND
                    (
                        CASE
                            WHEN is_expire_type = 1 AND current_timestamp() > expire_time THEN FALSE
                            ELSE TRUE
                        END
                    );`;

    const [[r1, m1], [r2, m2], [r3, m3]] = await Promise.all([
      sequelize.query(sql1),
      sequelize.query(sql2),
      sequelize.query(sql3),
    ]);

    return res.status(200).json({
      data: {
        ...r1[0],
        maxLink: {
          ...r2[0],
        },
        ...r3[0],
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
