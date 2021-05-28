// import express.router to create REST API routes
const express = require('express');
const router = express.Router();
const { requireSignin, authMiddleware, adminMiddleware } = require('../controllers/auth');
const { read, publicProfile, update, photo } = require('../controllers/user');

// User must be signed in to use these routes
router.get('/user/profile', requireSignin, authMiddleware, read);
router.put('/user/update', requireSignin, authMiddleware, update);

router.get('/user/:username', publicProfile);
router.get('/user/photo/:username', photo);

module.exports = router;