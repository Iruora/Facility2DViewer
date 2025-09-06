import mongoose from 'mongoose';

const machineSchema = new mongoose.Schema({
  name: { type: String, required: true },
  roomId: { type: String, required: true },
  x: { type: Number, required: true },
  y: { type: Number, required: true },
  status: { type: String, enum: ['free', 'occupied', 'broken'], default: 'free' }
});

export default mongoose.model('Machine', machineSchema);