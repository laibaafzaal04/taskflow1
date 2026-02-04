import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/user.js';
import Project from '../models/project.js';
import Task from '../models/task.js';

dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/taskflow');
    console.log('Connected to MongoDB');

    await User.deleteMany({});
    await Project.deleteMany({});
    await Task.deleteMany({});

    const user = await User.create({
      name: 'Demo User',
      email: 'demo@taskflow.com',
      password: 'password123',
      role: 'admin'
    });

    const projects = await Project.create([
      {
        name: 'Website Redesign',
        description: 'Complete overhaul of company website',
        color: 'blue',
        owner: user._id,
        members: [user._id]
      },
      {
        name: 'Mobile App Development',
        description: 'Build native mobile application',
        color: 'purple',
        owner: user._id,
        members: [user._id]
      },
      {
        name: 'Marketing Campaign',
        description: 'Q1 2024 marketing initiatives',
        color: 'green',
        owner: user._id,
        members: [user._id]
      }
    ]);

    await Task.create([
      {
        title: 'Design homepage mockup',
        description: 'Create initial design concepts for new homepage',
        project: projects[0]._id,
        assignee: user._id,
        priority: 'high',
        status: 'inProgress',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        createdBy: user._id
      },
      {
        title: 'Setup development environment',
        description: 'Configure local and staging environments',
        project: projects[1]._id,
        assignee: user._id,
        priority: 'high',
        status: 'done',
        createdBy: user._id
      },
      {
        title: 'Plan social media strategy',
        description: 'Outline content calendar for Q1',
        project: projects[2]._id,
        assignee: user._id,
        priority: 'medium',
        status: 'todo',
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        createdBy: user._id
      }
    ]);

    console.log(' Seed data created successfully');
    console.log(' Login: demo@taskflow.com');
    console.log(' Password: password123');
    process.exit(0);
  } catch (error) {
    console.error(' Error seeding data:', error);
    process.exit(1);
  }
};

seedData();