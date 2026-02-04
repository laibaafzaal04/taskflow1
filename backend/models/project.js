import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, 'Project name is required'],
    trim: true
  },
  description: { 
    type: String, 
    default: '',
    trim: true
  },
  color: { 
    type: String, 
    enum: ['blue', 'purple', 'green', 'red', 'yellow', 'pink'],
    default: 'blue' 
  },
  owner: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true
  },
  members: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  }],
  status: { 
    type: String,
    enum: ['active', 'completed', 'archived'],
    default: 'active' 
  },
  progress: {
    type: Number,
    min: [0, 'Progress cannot be less than 0'],
    max: [100, 'Progress cannot exceed 100'],
    default: 0
  }
}, { 
  timestamps: true 
});

// Add owner to members if not present
projectSchema.pre('save', function(next) {
  if (!this.members.includes(this.owner)) {
    this.members.push(this.owner);
  }
  next();
});

const Project = mongoose.model('Project', projectSchema);

export default Project;