const Test = require('../models/Test');
const User = require('../models/User');
const Category = require('../models/Category');
const Subject = require('../models/Subject');
const mongoose = require('mongoose');

// Get detailed statistics for admin dashboard
const getDetailedStats = async (req, res) => {
  try {
    // Make sure only admins can access this endpoint
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized as an admin' });
    }
    
    // Get tests per category with user info and scores
    const testsPerCategory = await Test.aggregate([
      {
        $lookup: {
          from: 'subjects',
          localField: 'subject',
          foreignField: '_id',
          as: 'subjectDetails'
        }
      },
      {
        $unwind: '$subjectDetails'
      },
      {
        $lookup: {
          from: 'categories',
          localField: 'subjectDetails.category',
          foreignField: '_id',
          as: 'categoryDetails'
        }
      },
      {
        $unwind: '$categoryDetails'
      },
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'userDetails'
        }
      },
      {
        $unwind: '$userDetails'
      },
      {
        $project: {
          _id: 1,
          score: 1,
          completed: 1,
          createdAt: 1,
          'userDetails.name': 1,
          'userDetails._id': 1,
          'subjectDetails.name': 1,
          'subjectDetails._id': 1,
          'categoryDetails.name': 1,
          'categoryDetails._id': 1
        }
      },
      {
        $group: {
          _id: {
            categoryId: '$categoryDetails._id',
            categoryName: '$categoryDetails.name',
            subjectId: '$subjectDetails._id',
            subjectName: '$subjectDetails.name'
          },
          tests: {
            $push: {
              _id: '$_id',
              score: '$score',
              completed: '$completed',
              user: {
                _id: '$userDetails._id',
                name: '$userDetails.name'
              },
              createdAt: '$createdAt'
            }
          },
          testCount: { $sum: 1 },
          avgScore: { $avg: '$score' },
          usersCount: { $addToSet: '$userDetails._id' }
        }
      },
      {
        $addFields: {
          usersCount: { $size: '$usersCount' }
        }
      },
      {
        $group: {
          _id: {
            categoryId: '$_id.categoryId',
            categoryName: '$_id.categoryName'
          },
          subjects: {
            $push: {
              _id: '$_id.subjectId',
              name: '$_id.subjectName',
              testCount: '$testCount',
              avgScore: '$avgScore',
              usersCount: '$usersCount',
              tests: '$tests'
            }
          },
          totalTests: { $sum: '$testCount' },
          totalUsers: { $addToSet: '$tests.user._id' }
        }
      },
      {
        $addFields: {
          totalUniqueUsers: { $size: { $reduce: { input: '$subjects.tests', initialValue: [], in: { $concatArrays: ['$$value', '$$this.user._id'] } } } }
        }
      },
      {
        $sort: { '_id.categoryName': 1 }
      }
    ]);

    // Get the total number of tests taken
    const totalTests = await Test.countDocuments({ completed: true });
    
    // Get the total number of users who have taken tests
    const testTakers = await Test.distinct('user', { completed: true });
    const totalTestTakers = testTakers.length;
    
    // Get the average score across all tests
    const avgScoreResult = await Test.aggregate([
      { $match: { completed: true } },
      { $group: { _id: null, avgScore: { $avg: '$score' } } }
    ]);
    
    const overallAvgScore = avgScoreResult.length > 0 ? avgScoreResult[0].avgScore : 0;
    
    res.json({
      categoriesBreakdown: testsPerCategory,
      overallStats: {
        totalTests,
        totalTestTakers,
        overallAvgScore
      }
    });
    
  } catch (error) {
    console.error('Error fetching admin statistics:', error);
    res.status(500).json({ message: 'Failed to fetch statistics', error: error.message });
  }
};

// Get user-specific test statistics
const getUserTestStats = async (req, res) => {
  try {
    const { userId } = req.params;

    // Make sure only admins can access this endpoint
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized as an admin' });
    }

    // Validate user ID
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    // Get the user's details
    const user = await User.findById(userId, 'name email role');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get the user's test history with subject and category details
    const testHistory = await Test.aggregate([
      { 
        $match: { 
          user: new mongoose.Types.ObjectId(userId), 
          completed: true 
        }
      },
      {
        $lookup: {
          from: 'subjects',
          localField: 'subject',
          foreignField: '_id',
          as: 'subjectDetails'
        }
      },
      {
        $unwind: '$subjectDetails'
      },
      {
        $lookup: {
          from: 'categories',
          localField: 'subjectDetails.category',
          foreignField: '_id',
          as: 'categoryDetails'
        }
      },
      {
        $unwind: '$categoryDetails'
      },
      {
        $project: {
          _id: 1,
          score: 1,
          completed: 1,
          createdAt: 1,
          'subjectDetails.name': 1,
          'categoryDetails.name': 1
        }
      },
      { $sort: { createdAt: -1 } }
    ]);

    // Calculate the user's statistics
    const totalTests = testHistory.length;
    const avgScore = testHistory.reduce((sum, test) => sum + test.score, 0) / (totalTests || 1);

    // Group tests by category and subject
    const testsByCategory = {};
    testHistory.forEach(test => {
      const categoryName = test.categoryDetails.name;
      const subjectName = test.subjectDetails.name;

      if (!testsByCategory[categoryName]) {
        testsByCategory[categoryName] = { tests: 0, subjects: {} };
      }

      testsByCategory[categoryName].tests++;

      if (!testsByCategory[categoryName].subjects[subjectName]) {
        testsByCategory[categoryName].subjects[subjectName] = [];
      }

      testsByCategory[categoryName].subjects[subjectName].push({
        id: test._id,
        score: test.score,
        date: test.createdAt
      });
    });

    res.json({
      user,
      stats: {
        totalTests,
        avgScore,
        testsByCategory
      },
      testHistory
    });

  } catch (error) {
    console.error('Error fetching user test statistics:', error);
    res.status(500).json({ message: 'Failed to fetch user statistics', error: error.message });
  }
};
module.exports = { getDetailedStats, getUserTestStats };