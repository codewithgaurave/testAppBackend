const Test = require('../models/Test');
const Question = require('../models/Question');

const createTest = async (req, res) => {
  const { subject } = req.body;
  const test = await Test.create({ user: req.user._id, subject });
  res.status(201).json(test);
};

const submitTest = async (req, res) => {
  const { answers } = req.body;
  const test = await Test.findById(req.params.id);
  if (!test) {
    return res.status(404).json({ message: 'Test not found' });
  }
  if (test.user.toString() !== req.user._id.toString()) {
    return res.status(401).json({ message: 'Not authorized' });
  }
  if (test.completed) {
    return res.status(400).json({ message: 'Test already completed' });
  }
  test.answers = answers;
  test.completed = true;
  let correctAnswers = 0;
  for (let answer of answers) {
    const question = await Question.findById(answer.question);
    if (question && question.correctOption === answer.selectedOption) {
      correctAnswers++;
    }
  }
  test.score = (correctAnswers / answers.length) * 100;
  await test.save();
  res.json(test);
};

const getTestsByUser = async (req, res) => {
  const tests = await Test.find({ user: req.user._id }).populate('subject', 'name').sort('-createdAt');
  res.json(tests);
};

module.exports = { createTest, submitTest, getTestsByUser };