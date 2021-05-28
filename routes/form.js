// import express.router to create REST API routes
const express = require('express');
const router = express.Router();
const { contactForm, contactSubmissionAuthorForm } = require('../controllers/form');

// Import all validators
const { runValidation } = require('../validators');
const { contactFormValidator } = require('../validators/form');

router.post('/contact', contactFormValidator, runValidation, contactForm);
router.post('/contact-submission-author', contactFormValidator, runValidation, contactSubmissionAuthorForm);

module.exports = router;