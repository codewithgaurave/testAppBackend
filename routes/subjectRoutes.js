const express = require('express');
const { createSubject, getSubjectsByCategory, getSubjectById, getAllSubjects } = require('../controllers/subjectController');
const { protect, admin } = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/', protect, admin, createSubject);
router.get('/', protect, getAllSubjects); 
router.get('/category/:categoryId', protect, getSubjectsByCategory);
router.get('/:id', protect, getSubjectById);

module.exports = router;