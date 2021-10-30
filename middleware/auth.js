const _ = require('lodash');
const jwt = require('jsonwebtoken');

const handleTokenAuth = async (req, res, next) => {
  const authHeader = req.headers['authorization'];

  if (_.isString(authHeader)) {
    const [authMethod, authToken] = authHeader.split(' ');

    if (!_.isNil(authToken) && _.isString(authToken)) {
      try {
        const dataPayload = await jwt.verify(authToken, process.env.JWT_SECRET);

        if (_.isObjectLike(dataPayload)) {
          res.locals.dataPayload = dataPayload;

          next();
        }
      } catch (err) {
        console.error('Error while verifying token', err);
        return res.status(401).json({
          message: 'You are not authorized to access this account',
        });
      }
    } else {
      return res.status(403).json({
        message: 'You are not authorized to access this account',
      });
    }
  } else {
    return res.status(403).json({
      message: 'You are not authorized to access this account',
    });
  }
};

module.exports = {
  handleTokenAuth,
};
