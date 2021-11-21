const express = require('express');
const { handleTokenAuth } = require('../../middleware/auth');

const router = express.Router();

router.use('/auth', require('./auth/index'));

router.use('/dashboard', handleTokenAuth, require('./dashboard/index'));

router.use('/links', handleTokenAuth, require('./links/index'));

router.use('/redirect', require('./redirect/index'));

module.exports = router;
