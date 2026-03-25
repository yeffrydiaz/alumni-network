const express = require('express');
const mongoose = require('mongoose');
const Event = require('../models/Event');
const auth = require('../middleware/auth');

const router = express.Router();

const PAGE_SIZE = 10;

// GET /api/events - list events with optional filters
router.get('/', async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.max(parseInt(req.query.limit) || PAGE_SIZE, 1);
    const skip = (page - 1) * limit;

    const filter = {};

    if (req.query.status) filter.status = req.query.status;
    if (req.query.category) filter.category = req.query.category;
    if (req.query.search) {
      filter.$text = { $search: req.query.search };
    }

    const [data, total] = await Promise.all([
      Event.find(filter)
        .populate('organizer', 'name email avatar')
        .sort({ date: 1 })
        .skip(skip)
        .limit(limit),
      Event.countDocuments(filter),
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

// GET /api/events/my/events - get events organized by or attended by the current user
router.get('/my/events', auth, async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.max(parseInt(req.query.limit) || PAGE_SIZE, 1);
    const skip = (page - 1) * limit;

    const filter = {
      $or: [{ organizer: req.user._id }, { attendees: req.user._id }],
    };

    const [data, total] = await Promise.all([
      Event.find(filter)
        .populate('organizer', 'name email avatar')
        .sort({ date: 1 })
        .skip(skip)
        .limit(limit),
      Event.countDocuments(filter),
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

// GET /api/events/:id - get a single event
router.get('/:id', async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid event id' });
    }

    const event = await Event.findById(req.params.id)
      .populate('organizer', 'name email avatar')
      .populate('attendees', 'name email avatar');

    if (!event) return res.status(404).json({ message: 'Event not found' });

    res.json(event);
  } catch (err) {
    next(err);
  }
});

// POST /api/events - create an event (auth required)
router.post('/', auth, async (req, res, next) => {
  try {
    const { title, description, date, location, maxAttendees, category } = req.body;

    if (!title || !description || !date) {
      return res.status(422).json({ message: 'title, description and date are required' });
    }

    const event = await Event.create({
      title,
      description,
      date,
      location,
      maxAttendees,
      category,
      organizer: req.user._id,
    });

    res.status(201).json(event);
  } catch (err) {
    next(err);
  }
});

// PUT /api/events/:id - update event (organizer only)
router.put('/:id', auth, async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid event id' });
    }

    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    if (event.organizer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this event' });
    }

    const forbidden = ['organizer', 'attendees'];
    forbidden.forEach((f) => delete req.body[f]);

    Object.assign(event, req.body);
    await event.save();

    res.json(event);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/events/:id - organizer or admin
router.delete('/:id', auth, async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid event id' });
    }

    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    const isOrganizer = event.organizer.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOrganizer && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized to delete this event' });
    }

    await event.deleteOne();
    res.json({ message: 'Event deleted successfully' });
  } catch (err) {
    next(err);
  }
});

// POST /api/events/:id/attend - register attendance
router.post('/:id/attend', auth, async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid event id' });
    }

    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    if (event.status === 'cancelled' || event.status === 'completed') {
      return res.status(400).json({ message: 'Cannot register for a cancelled or completed event' });
    }

    const alreadyAttending = event.attendees.some(
      (id) => id.toString() === req.user._id.toString()
    );
    if (alreadyAttending) {
      return res.status(409).json({ message: 'You are already registered for this event' });
    }

    if (event.maxAttendees && event.attendees.length >= event.maxAttendees) {
      return res.status(400).json({ message: 'Event is at full capacity' });
    }

    event.attendees.push(req.user._id);
    await event.save();

    res.json({ message: 'Successfully registered for event' });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/events/:id/attend - cancel attendance
router.delete('/:id/attend', auth, async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid event id' });
    }

    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    const index = event.attendees.findIndex(
      (id) => id.toString() === req.user._id.toString()
    );
    if (index === -1) {
      return res.status(404).json({ message: 'You are not registered for this event' });
    }

    event.attendees.splice(index, 1);
    await event.save();

    res.json({ message: 'Attendance cancelled successfully' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
