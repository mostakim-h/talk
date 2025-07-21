const validateRequest = require('../middlewares/validateRequestMiddleware');

const validateUtils = (rules) => [...rules, validateRequest];

module.exports = validateUtils;