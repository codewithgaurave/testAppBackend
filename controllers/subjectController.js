const Subject = require('../models/Subject');

const createSubject = async (req, res) => {
  const { name, description, category } = req.body;
  const subject = await Subject.create({ name, description, category, createdBy: req.user._id });
  res.status(201).json(subject);
};

const getAllSubjects = async (req, res) => {
  try {
    const subjects = await Subject.find({});
    res.json(subjects);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch subjects' });
  }
};

const getSubjectsByCategory = async (req, res) => {
  const subjects = await Subject.find({ category: req.params.categoryId });
  res.json(subjects);
};

const getSubjectById = async (req, res) => {
  const subject = await Subject.findById(req.params.id);
  if (subject) {
    res.json(subject);
  } else {
    res.status(404).json({ message: 'Subject not found' });
  }
};

module.exports = { createSubject, getSubjectsByCategory, getSubjectById, getAllSubjects };