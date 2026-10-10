import { Router } from 'express';
import mongoose from 'mongoose';
import Enrollment from '../models/Enrollment.js';
import Course from '../models/Course.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
const router = Router();
router.post('/:courseId', requireAuth, async (req, res, next) => {
  try {
    if (req.user.role !== 'student') return res.status(403).json({ message: 'Only student accounts can enroll.' });
    if (!mongoose.isValidObjectId(req.params.courseId)) return res.status(400).json({ message: 'Invalid course ID.' });
    const course = await Course.findOne({ _id: req.params.courseId, isActive: true });
    if (!course) return res.status(404).json({ message: 'Course not found or inactive.' });
    if (await Enrollment.exists({ studentId: req.user.id, courseId: course._id })) return res.status(409).json({ message: 'You already have an enrollment record for this course.' });
    const approved = await Enrollment.countDocuments({ courseId: course._id, status: 'approved' });
    if (approved >= course.capacity) return res.status(409).json({ message: 'This course is full.' });
    const enrollment = await Enrollment.create({ studentId: req.user.id, courseId: course._id });
    res.status(201).json({ message: 'Enrollment request submitted.', enrollment });
  } catch (e) { if (e.code === 11000) return res.status(409).json({ message: 'You already have an enrollment record for this course.' }); next(e); }
});
router.get('/mine', requireAuth, async (req, res, next) => { try { const enrollments = await Enrollment.find({ studentId: req.user.id }).populate('courseId').sort({ createdAt: -1 }); res.json({ enrollments }); } catch (e) { next(e); } });
router.get('/', requireAuth, requireAdmin, async (_req, res, next) => { try { const enrollments = await Enrollment.find().populate('studentId', 'name email').populate('courseId', 'title capacity').sort({ createdAt: -1 }); res.json({ enrollments }); } catch (e) { next(e); } });
router.patch('/:id/status', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['approved', 'rejected'].includes(status)) return res.status(400).json({ message: 'Status must be approved or rejected.' });
    const enrollment = await Enrollment.findById(req.params.id);
    if (!enrollment) return res.status(404).json({ message: 'Enrollment not found.' });
    if (status === 'approved' && enrollment.status !== 'approved') {
      const course = await Course.findById(enrollment.courseId);
      if (!course?.isActive) return res.status(409).json({ message: 'Course is inactive or unavailable.' });
      if (await Enrollment.countDocuments({ courseId: course._id, status: 'approved' }) >= course.capacity) return res.status(409).json({ message: 'No seats are available.' });
    }
    enrollment.status = status; await enrollment.save(); res.json({ enrollment });
  } catch (e) { next(e); }
});
router.patch('/:id/cancel', requireAuth, async (req, res, next) => {
  try { const enrollment = await Enrollment.findOne({ _id: req.params.id, studentId: req.user.id }); if (!enrollment) return res.status(404).json({ message: 'Enrollment not found.' }); if (!['pending', 'approved'].includes(enrollment.status)) return res.status(409).json({ message: 'This enrollment cannot be cancelled.' }); enrollment.status = 'cancelled'; await enrollment.save(); res.json({ message: 'Enrollment cancelled.', enrollment }); }
  catch (e) { next(e); }
});
export default router;
