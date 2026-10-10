import mongoose from 'mongoose';
const schema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 150 },
  description: { type: String, required: true },
  category: { type: String, required: true, trim: true },
  instructor: { type: String, required: true, trim: true },
  durationWeeks: { type: Number, required: true, min: 1 },
  capacity: { type: Number, required: true, min: 1 },
  prerequisites: { type: String, default: '' },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });
export default mongoose.model('Course', schema);
