const express = require('express');
const mongoose = require('mongoose');
const Job = require('../models/Job');
const auth = require('../middleware/auth');

const router = express.Router();

const PAGE_SIZE = 10;

// GET /api/jobs - list jobs with optional filters
router.get('/', async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.max(parseInt(req.query.limit) || PAGE_SIZE, 1);
    const skip = (page - 1) * limit;

    const filter = {};

    if (req.query.jobType) filter.jobType = req.query.jobType;
    if (req.query.status) filter.status = req.query.status;
    if (req.query.search) {
      filter.$text = { $search: req.query.search };
    }

    const [data, total] = await Promise.all([
      Job.find(filter)
        .populate('postedBy', 'name email avatar')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Job.countDocuments(filter),
    ]);

    res.json({
      data,
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

// GET /api/jobs/my/postings - get current user's job postings
router.get('/my/postings', auth, async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.max(parseInt(req.query.limit) || PAGE_SIZE, 1);
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      Job.find({ postedBy: req.user._id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Job.countDocuments({ postedBy: req.user._id }),
    ]);

    res.json({
      data,
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

// GET /api/jobs/:id - get a single job
router.get('/:id', async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid job id' });
    }

    const job = await Job.findById(req.params.id)
      .populate('postedBy', 'name email avatar')
      .populate('applicants', 'name email avatar');

    if (!job) return res.status(404).json({ message: 'Job not found' });

    res.json(job);
  } catch (err) {
    next(err);
  }
});

// POST /api/jobs - create a job (auth required)
router.post('/', auth, async (req, res, next) => {
  try {
    const { title, company, location, description, requirements, salary, jobType } = req.body;

    if (!title || !company || !description || !jobType) {
      return res.status(422).json({ message: 'title, company, description and jobType are required' });
    }

    const job = await Job.create({
      title,
      company,
      location,
      description,
      requirements,
      salary,
      jobType,
      postedBy: req.user._id,
    });

    res.status(201).json(job);
  } catch (err) {
    next(err);
  }
});

// PUT /api/jobs/:id - update a job (owner only)
router.put('/:id', auth, async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid job id' });
    }

    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    if (job.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this job' });
    }

    const forbidden = ['postedBy', 'applicants'];
    forbidden.forEach((f) => delete req.body[f]);

    Object.assign(job, req.body);
    await job.save();

    res.json(job);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/jobs/:id - owner or admin
router.delete('/:id', auth, async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid job id' });
    }

    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    const isOwner = job.postedBy.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized to delete this job' });
    }

    await job.deleteOne();
    res.json({ message: 'Job deleted successfully' });
  } catch (err) {
    next(err);
  }
});

// POST /api/jobs/:id/apply - apply for a job (auth required)
router.post('/:id/apply', auth, async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid job id' });
    }

    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    if (job.status === 'closed') {
      return res.status(400).json({ message: 'This job is no longer accepting applications' });
    }

    const alreadyApplied = job.applicants.some(
      (id) => id.toString() === req.user._id.toString()
    );
    if (alreadyApplied) {
      return res.status(409).json({ message: 'You have already applied for this job' });
    }

    job.applicants.push(req.user._id);
    await job.save();

    res.json({ message: 'Application submitted successfully' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
