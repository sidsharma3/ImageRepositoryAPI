// import express.router to create REST API routes
const express = require('express');
const router = express.Router();
const { create, list, listAllSubmissionsCategoriesTags, read, remove, update, photo, listRelated, listSearch, listByUser } = require('../controllers/submission');
// Here we do not need validators but instead use the auth controllers to 
// ensure the user is signed in and has the proper credentials
const { requireSignin, adminMiddleware, authMiddleware, canUpdateDeleteSubmission } = require('../controllers/auth');

// Admin role required
router.post('/submission', requireSignin, adminMiddleware, create);
router.get('/submissions', list);
router.post('/submissions-categories-tags', listAllSubmissionsCategoriesTags);
router.get('/submission/:slug', read);
router.delete('/submission/:slug', requireSignin, adminMiddleware, remove);
router.put('/submission/:slug', requireSignin, adminMiddleware, update);
router.post('/submissions/related', listRelated);
router.get('/submissions/search', listSearch);

// Auth role required
router.post('/user/submission', requireSignin, authMiddleware, create);
router.get('/:username/submissions', listByUser);
router.delete('/user/submission/:slug', requireSignin, authMiddleware, canUpdateDeleteSubmission, remove);
router.put('/user/submission/:slug', requireSignin, authMiddleware, canUpdateDeleteSubmission, update);

module.exports = router;