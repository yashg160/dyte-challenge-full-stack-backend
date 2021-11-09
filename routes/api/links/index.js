const _ = require('lodash');
const express = require('express');
const randomstring = require('randomstring');
const LinkModel = require('../../../models/Link');
const sequelize = require('../../../sequelize');

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    // Get all links for this user
    const sql1 = `SELECT *, (
                        CASE
                            WHEN is_expire_type = 0 OR expire_time IS NULL THEN FALSE
                            WHEN is_expire_type = 1 AND expire_time IS NOT NULL AND current_timestamp() > expire_time THEN FALSE
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

router.put('/:linkId', async (req, res, next) => {
  try {
    let errors = [];

    if (!_.has(req.body, 'slug')) errors.push('back half is a required field');

    if (errors.length !== 0) {
      return res.status(400).json({
        message: 'Errors were found with the data',
        errors: errors,
      });
    }

    try {
      // Get update data. Only those values that are allowed to be updated
      const includeObjectKeys = ['slug', 'is_expire_type', 'expire_time'];
      let updateDataPayload = _.pickBy(req.body, (value, key) =>
        includeObjectKeys.includes(key)
      );

      if (
        _.has(updateDataPayload, 'expire_time') &&
        updateDataPayload.expire_time === ''
      ) {
        updateDataPayload.expire_time = null;
      }

      const promises = [
        LinkModel.update(updateDataPayload, {
          where: {
            id: req.params.linkId,
          },
        }),
      ];

      const [updateResult] = await Promise.all(promises);

      return res.status(200).json({
        data: {
          id: req.params.linkId,
        },
        message: 'Updated short link',
      });
    } catch (err) {
      if (
        err.errors.length === 1 &&
        err.errors[0].type === 'unique violation' &&
        err.errors[0].path === 'uc_slug'
      ) {
        return res.status(409).json({
          errors: ['This back half cannot be used for a short link'],
          message: 'This back half cannot be used for a short link',
        });
      }
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
