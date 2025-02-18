const Category = require('../models/Category');

const createCategory = async (req, res) => {
  const { name, description } = req.body;
  const categoryExists = await Category.findOne({ name });
  if (categoryExists) {
    return res.status(400).json({ message: 'Category already exists' });
  }
  const category = await Category.create({ name, description, createdBy: req.user._id });
  res.status(201).json(category);
};

const getCategories = async (req, res) => {
  const categories = await Category.find({});
  res.json(categories);
};

const getCategoryById = async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (category) {
    res.json(category);
  } else {
    res.status(404).json({ message: 'Category not found' });
  }
};

module.exports = { createCategory, getCategories, getCategoryById };