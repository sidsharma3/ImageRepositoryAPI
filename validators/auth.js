const { check } = require('express-validator');
// These series of functions make sure that all the data 
// received to the REST API has the correct type and parameters.

// the withMessage function is used to set
// the error message we must return.
exports.userSignupValidator = [
    // the not validator inverts the
    // result on the next validation chain instance
    check('name')
        .not()
        .isEmpty()
        .withMessage('Name is required'),
    check('email')
        .isEmail()
        .withMessage('Must be a valid email address'),
    check('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long')
];

exports.userSigninValidator = [
    check('email')
        .isEmail()
        .withMessage('Must be a valid email address'),
    check('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long')
];

exports.forgotPasswordValidator = [
    check('email')
        .isEmail()
        .withMessage('Must be a valid email address')
];

exports.resetPasswordValidator = [
    check('newPassword')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long')
];