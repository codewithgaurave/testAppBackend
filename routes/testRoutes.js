const express = require('express');
const { createTest, submitTest, getTestsByUser } = require('../controllers/testController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/', protect, createTest);
router.put('/:id', protect, submitTest);
router.get('/user', protect, getTestsByUser);

module.exports = router;