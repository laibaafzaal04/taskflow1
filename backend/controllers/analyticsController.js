import Task from '../models/task.js';
import User from '../models/user.js';
import Project from '../models/project.js';

// @desc    Get analytics data
// @route   GET /api/analytics
// @access  Admin only
export const getAnalytics = async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    const totalProjects = await Project.countDocuments({});
    const totalTasks = await Task.countDocuments({});

    const tasksByStatus = await Task.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const tasksByPriority = await Task.aggregate([
      { $group: { _id: '$priority', count: { $sum: 1 } } }
    ]);

    // Fix: single aggregation instead of N+1 per-user Task.find() calls
    const taskStatsByUser = await Task.aggregate([
      {
        $group: {
          _id: '$assignee',
          totalTasks: { $sum: 1 },
          completed: { $sum: { $cond: [{ $eq: ['$status', 'done'] }, 1, 0] } },
          inProgress: { $sum: { $cond: [{ $eq: ['$status', 'inProgress'] }, 1, 0] } },
          todo: { $sum: { $cond: [{ $eq: ['$status', 'todo'] }, 1, 0] } }
        }
      }
    ]);

    const statsMap = {};
    for (const stat of taskStatsByUser) {
      if (stat._id) statsMap[stat._id.toString()] = stat;
    }

    const userAnalytics = users.map((u) => {
      const stats = statsMap[u._id.toString()] || {
        totalTasks: 0, completed: 0, inProgress: 0, todo: 0
      };
      return {
        user: u.name,
        email: u.email,
        role: u.role,
        isActive: u.isActive,
        totalTasks: stats.totalTasks,
        completed: stats.completed,
        inProgress: stats.inProgress,
        todo: stats.todo
      };
    });

    res.json({
      summary: { totalUsers: users.length, totalProjects, totalTasks },
      tasksByStatus,
      tasksByPriority,
      userAnalytics
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ message: error.message });
  }
};