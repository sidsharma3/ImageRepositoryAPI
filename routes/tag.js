// import express.router to create REST API routes
const express = require('express');
const router = express.Router();

// controllers
const { requireSignin, adminMiddleware } = require('../controllers/auth');
const { create, list, read, remove } = require('../controllers/tag');

// validators
const { runValidation } = require('../validators');
const { createTagValidator } = require('../validators/tag');

// Admin role needed
router.post('/tag', createTagValidator, runValidation, requireSignin, adminMiddleware, create);
router.delete('/tag/:slug', requireSignin, adminMiddleware, remove);

router.get('/tags', list);
router.get('/tag/:slug', read);


module.exports = router; 