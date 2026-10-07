import mongoose from 'mongoose'

const projectSchema = new mongoose.Schema({ name: String, description: String, technologies: [String], githubUrl: String, liveUrl: String }, { _id: true })
const certificationSchema = new mongoose.Schema({ name: String, organization: String, date: String, url: String }, { _id: true })
const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true, select: false },
  phone: String, location: String, college: String, degree: String, branch: String,
  currentYear: String, graduationYear: Number, cgpa: Number, skills: [String],
  projects: [projectSchema], certifications: [certificationSchema],
  preferences: { roles: [String], locations: [String], opportunityTypes: [String] },
}, { timestamps: true })
export default mongoose.model('User', userSchema)
