import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: [true, 'Task title is required'],
    trim: true
  },
  description: { 
    type: String, 
    default: '',
    trim: true 
  },
  project: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Project',
    required: [true, 'Project is required']
  },
  assignee: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    default: null
  },
  priority: { 
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium' 
  },
  status: { 
    type: String,
    enum: ['todo', 'inProgress', 'done'],
    default: 'todo' 
  },
  dueDate: { 
    type: Date,
    default: null
  },
  comments: [{
    text: { type: String, required: true, trim: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    createdAt: { type: Date, default: Date.now }
  }],
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Fix: virtual instead of stored field — always accurate, never drifts
taskSchema.virtual('commentCount').get(function () {
  return this.comments.length;
});

// Indexes
taskSchema.index({ project: 1, status: 1 });
taskSchema.index({ assignee: 1 });

const Task = mongoose.model('Task', taskSchema);

export default Task;