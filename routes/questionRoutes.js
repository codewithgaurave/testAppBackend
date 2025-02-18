const express = require('express');
const { createQuestion, getQuestionsBySubject } = require('../controllers/questionController');
const { protect, admin } = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/', protect, admin, createQuestion);
router.get('/subject/:subjectId', protect, getQuestionsBySubject);

module.exports = router;