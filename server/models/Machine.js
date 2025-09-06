import mongoose from 'mongoose';

const machineSchema = new mongoose.Schema({
  name: { type: String, required: true },
  roomId: { type: String, required: true },
  x: { type: Number, required: true },
  y: { type: Number, required: true }
});

export default mongoose.model('Machine', machineSchema);