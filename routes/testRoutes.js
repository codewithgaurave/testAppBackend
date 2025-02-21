const express = require('express');
const { createTest, submitTest, getTestsByUser, getAllTests } = require('../controllers/testController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/', protect, createTest);
router.get('/', protect, getAllTests);
router.put('/:id', protect, submitTest);
router.get('/user', protect, getTestsByUser);

module.exports = router;