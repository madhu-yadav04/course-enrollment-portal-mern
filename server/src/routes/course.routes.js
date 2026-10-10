import { Router } from 'express';
import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
const router = Router();
router.get('/', async (req, res, next) => {
  try {
    const filter = { isActive: true };
    if (req.query.category) filter.category = req.query.category;
    if (req.query.search) filter.$or = [{ title: { $regex: req.query.search, $options: 'i' } }, { description: { $regex: req.query.search, $options: 'i' } }];
    const courses = await Course.find(filter).sort({ createdAt: -1 }).lean();
    const counts = await Enrollment.aggregate([{ $match: { courseId: { $in: courses.map(c => c._id) }, status: 'approved' } }, { $group: { _id: '$courseId', count: { $sum: 1 } } }]);
    const map = new Map(counts.map(x => [String(x._id), x.count]));
    res.json({ courses: courses.map(c => ({ ...c, approvedCount: map.get(String(c._id)) || 0, seatsAvailable: Math.max(0, c.capacity - (map.get(String(c._id)) || 0)) })) });
  } catch (e) { next(e); }
});
router.get('/:id', async (req, res, next) => {
  try { const course = await Course.findOne({ _id: req.params.id, isActive: true }); if (!course) return res.status(404).json({ message: 'Course not found.' }); const approvedCount = await Enrollment.countDocuments({ courseId: course._id, status: 'approved' }); res.json({ course, approvedCount, seatsAvailable: Math.max(0, course.capacity - approvedCount) }); }
  catch (e) { next(e); }
});
router.post('/', requireAuth, requireAdmin, async (req, res, next) => { try { const course = await Course.create(req.body); res.status(201).json({ course }); } catch (e) { next(e); } });
router.patch('/:id', requireAuth, requireAdmin, async (req, res, next) => { try { const course = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }); if (!course) return res.status(404).json({ message: 'Course not found.' }); res.json({ course }); } catch (e) { next(e); } });
export default router;
