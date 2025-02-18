const mongoose = require('mongoose');

const testSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
  answers: [
    {
      question: { type: mongoose.Schema.Types.ObjectId, ref: 'Question' },
      selectedOption: { type: String },
    },
  ],
  score: { type: Number, default: 0 },
  completed: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Test', testSchema);