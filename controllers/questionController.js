const Question = require('../models/Question');
const mongoose = require('mongoose');

const createQuestion = async (req, res) => {
  try {
    const { text, options, correctOption, subject } = req.body;
    
    // Basic validation
    if (!text) {
      return res.status(400).json({ message: 'Question text is required' });
    }
    
    if (!subject) {
      return res.status(400).json({ message: 'Subject is required' });
    }
    
    // Validate subject is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(subject)) {
      return res.status(400).json({ message: 'Invalid subject ID' });
    }
    
    // Check if options array has content
    if (!options || !Array.isArray(options) || options.length < 2) {
      return res.status(400).json({ message: 'At least two options are required' });
    }
    
    // Make sure all options have text
    for (const option of options) {
      if (!option.text) {
        return res.status(400).json({ message: `Option ${option.id} text is required` });
      }
    }
    
    // Make sure correctOption exists in options
    const optionExists = options.some(opt => opt.id === correctOption);
    if (!optionExists) {
      return res.status(400).json({ message: 'Correct option must exist in options array' });
    }
    
    const question = await Question.create({ 
      text, 
      options, 
      correctOption, 
      subject, 
      createdBy: req.user._id 
    });
    
    res.status(201).json(question);
  } catch (error) {
    console.error('Error creating question:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

const getQuestionsBySubject = async (req, res) => {
  try {
    const { subjectId } = req.params;
    
    // Validate subject id
    if (!mongoose.Types.ObjectId.isValid(subjectId)) {
      return res.status(400).json({ message: 'Invalid subject ID' });
    }
    
    const questions = await Question.find({ subject: subjectId });
    res.json(questions);
  } catch (error) {
    console.error('Error fetching questions:', error);
    res.status(500).json({ message: 'Failed to fetch questions' });
  }
};

const getAllQuestions = async (req, res) => {
  try {
    const questions = await Question.find({});
    res.json(questions);
  } catch (error) {
    console.error('Error fetching all questions:', error);
    res.status(500).json({ message: 'Failed to fetch questions' });
  }
};

module.exports = { createQuestion, getQuestionsBySubject, getAllQuestions };