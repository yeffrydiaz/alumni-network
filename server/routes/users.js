const express = require('express');
const mongoose = require('mongoose');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

const PAGE_SIZE = 10;

// GET /api/users/profile - get current user's profile
router.get('/profile', auth, async (req, res, next) => {
  try {
    res.json(req.user);
  } catch (err) {
    next(err);
  }
});

// PUT /api/users/profile - update current user's profile
router.put('/profile', auth, async (req, res, next) => {
  try {
    const forbidden = ['password', 'email', 'role'];
    forbidden.forEach((f) => delete req.body[f]);

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    res.json(user);
  } catch (err) {
    next(err);
  }
});

// GET /api/users - list all alumni with pagination and search
// Uses an aggregation pipeline for flexible search across multiple fields
router.get('/', auth, async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.max(parseInt(req.query.limit) || PAGE_SIZE, 1);
    const skip = (page - 1) * limit;

    const { search, major, company, skills } = req.query;

    const matchStage = { role: 'alumni' };

    if (major) matchStage.major = { $regex: major, $options: 'i' };
    if (company) matchStage.company = { $regex: company, $options: 'i' };
    if (skills) {
      const skillList = skills.split(',').map((s) => s.trim()).filter(Boolean);
      if (skillList.length) {
        matchStage.$and = (matchStage.$and || []).concat(
          skillList.map((s) => ({ skills: { $regex: s, $options: 'i' } }))
        );
      }
    }
    if (search) {
      matchStage.$or = [
        { name: { $regex: search, $options: 'i' } },
        { major: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
        { skills: { $regex: search, $options: 'i' } },
      ];
    }

    const pipeline = [
      { $match: matchStage },
      {
        $facet: {
          data: [
            { $sort: { createdAt: -1 } },
            { $skip: skip },
            { $limit: limit },
            {
              $project: {
                password: 0,
              },
            },
          ],
          totalCount: [{ $count: 'count' }],
        },
      },
    ];

    const [result] = await User.aggregate(pipeline);
    const total = result.totalCount[0]?.count ?? 0;

    res.json({
      data: result.data,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/users/:id - get user by id
router.get('/:id', auth, async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid user id' });
    }

    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json(user);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/users/:id - admin only
router.delete('/:id', auth, async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid user id' });
    }

    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
