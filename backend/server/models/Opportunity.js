import mongoose from 'mongoose'
const opportunitySchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: String, organization: String, type: String, description: String, officialLink: String,
  deadline: Date, summary: String, requirements: [mongoose.Schema.Types.Mixed], skills: [String],
  documents: [mongoose.Schema.Types.Mixed], analysis: mongoose.Schema.Types.Mixed,
  status: { type: String, enum: ['saved', 'planning', 'in-progress', 'submitted', 'rejected', 'accepted'], default: 'saved' },
}, { timestamps: true })
export default mongoose.model('Opportunity', opportunitySchema)
