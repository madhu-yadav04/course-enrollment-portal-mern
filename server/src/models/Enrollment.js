import mongoose from 'mongoose';
const schema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected', 'cancelled'], default: 'pending' },
  enrolledAt: { type: Date, default: Date.now }
}, { timestamps: true });
schema.index({ studentId: 1, courseId: 1 }, { unique: true });
export default mongoose.model('Enrollment', schema);
