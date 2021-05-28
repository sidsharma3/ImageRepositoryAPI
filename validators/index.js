const { validationResult } = require('express-validator');

// Here we determine if any of the validators failed
// if so we give an unprocessable entity error code
// we call next() to prevent the application from stopping. 
// and move to the next callback function

exports.runValidation = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ error: errors.array()[0].msg });
    }
    next();
};