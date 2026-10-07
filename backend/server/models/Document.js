import mongoose from 'mongoose'
const documentSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  originalName: { type: String, required: true }, filename: { type: String, required: true },
  mimeType: String, size: Number, category: { type: String, default: 'Other' },
}, { timestamps: true })
export default mongoose.model('Document', documentSchema)
