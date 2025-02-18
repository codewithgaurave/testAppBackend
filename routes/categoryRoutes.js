const express = require('express');
const { createCategory, getCategories, getCategoryById } = require('../controllers/categoryController');
const { protect, admin } = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/', protect, admin, createCategory);
router.get('/', protect, getCategories);
router.get('/:id', protect, getCategoryById);

module.exports = router;