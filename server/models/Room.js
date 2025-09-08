import mongoose from 'mongoose';

const roomSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  path: { type: String, required: true },
  bbox: {
    x: { type: Number, required: true },
    y: { type: Number, required: true },
    width: { type: Number, required: true },
    height: { type: Number, required: true }
  },
  position: {
    x: { type: Number, default: 0 },
    y: { type: Number, default: 0 }
  }
});

export default mongoose.model('Room', roomSchema);