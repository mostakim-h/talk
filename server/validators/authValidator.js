const {body} = require('express-validator');

exports.registerValidator = [
  body('firstName')
    .notEmpty()
    .withMessage('First Name is required!')
    .bail()
    .isLength({min: 3, max: 50})
    .withMessage('First Name must be between 3 and 50 characters'),

  body('lastName')
    .notEmpty()
    .withMessage('Last Name is required!')
    .bail()
    .isLength({min: 3, max: 50})
    .withMessage('Last Name must be between 3 and 50 characters'),

  body('email')
    .notEmpty()
    .withMessage('Email is required!')
    .bail()
    .isEmail()
    .withMessage('Invalid email format'),

  body('password')
    .notEmpty()
    .withMessage('Password is required!')
    .bail()
    .isLength({min: 6})
    .withMessage('Password must be at least 6 characters long'),

  body('confirmPassword')
    .notEmpty()
    .withMessage('Confirm Password is required!')
    .bail()
    .custom((value, {req}) => {
      if (value !== req.body.password) {
        throw new Error('Passwords do not match');
      }
      return true;
    }),
];

exports.loginValidator = [
  body('email')
    .notEmpty()
    .withMessage('Email is required!')
    .bail()
    .isEmail()
    .withMessage('Invalid email format'),

  body('password')
    .notEmpty()
    .withMessage('Password is required!')
    .bail()
    .isLength({min: 6})
    .withMessage('Password must be at least 6 characters long'),
];