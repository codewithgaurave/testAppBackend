const express = require('express');
const { createQuestion, getQuestionsBySubject, getAllQuestions } = require('../controllers/questionController');
const { protect, admin } = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/', protect, admin, createQuestion);
router.get('/', protect, getAllQuestions);
router.get('/subject/:subjectId', protect, getQuestionsBySubject);

module.exports = router;