import Task from '../models/task.js';
import Project from '../models/project.js';

export const getTasks = async (req, res) => {
  try {
    const { projectId, status, priority } = req.query;
    let query = {};

    if (projectId) {
      query.project = projectId;
    } else {
      const userProjects = await Project.find({
        $or: [
          { owner: req.user._id },
          { members: req.user._id }
        ]
      }).select('_id');
      
      query.project = { $in: userProjects.map(p => p._id) };
    }

    if (status) {
      query.status = status;
    }

    if (priority) {
      query.priority = priority;
    }

    const tasks = await Task.find(query)
      .populate('assignee', 'name email')
      .populate('project', 'name color')
      .populate('createdBy', 'name email')
      .populate('comments.user', 'name email')  // Populate comments.user here too if needed
      .sort({ createdAt: -1 });

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// getTaskById
export const getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignee', 'name email')
      .populate('project', 'name color')
      .populate('createdBy', 'name email')
      .populate('comments.user', 'name email');

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const project = await Project.findById(task.project);
    const hasAccess = project.owner.toString() === req.user._id.toString() ||
                     project.members.some(m => m.toString() === req.user._id.toString());

    if (!hasAccess) {
      return res.status(403).json({ message: 'Not authorized to access this task' });
    }

    res.json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// createTask
export const createTask = async (req, res) => {
  try {
    const { title, description, project, assignee, priority, status, dueDate } = req.body;

    if (!title || !project) {
      return res.status(400).json({ message: 'Title and project are required' });
    }

    const proj = await Project.findById(project);
    if (!proj) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const hasAccess = proj.owner.toString() === req.user._id.toString() ||
                     proj.members.some(m => m.toString() === req.user._id.toString());

    if (!hasAccess) {
      return res.status(403).json({ message: 'Not authorized to add tasks to this project' });
    }

    const task = await Task.create({
      title,
      description,
      project,
      assignee: assignee || null,
      priority: priority || 'medium',
      status: status || 'todo',
      dueDate: dueDate || null,
      createdBy: req.user._id
    });

    const populated = await Task.findById(task._id)
      .populate('assignee', 'name email')
      .populate('project', 'name color')
      .populate('createdBy', 'name email')
      .populate('comments.user', 'name email');

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// updateTask
export const updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const project = await Project.findById(task.project);
    const hasAccess = project.owner.toString() === req.user._id.toString() ||
                     project.members.some(m => m.toString() === req.user._id.toString());

    if (!hasAccess) {
      return res.status(403).json({ message: 'Not authorized to update this task' });
    }

    const updated = await Task.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    const populated = await Task.findById(updated._id)
      .populate('assignee', 'name email')
      .populate('project', 'name color')
      .populate('createdBy', 'name email')
      .populate('comments.user', 'name email');

    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// deleteTask
export const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const project = await Project.findById(task.project);
    const hasAccess = project.owner.toString() === req.user._id.toString() ||
                     project.members.some(m => m.toString() === req.user._id.toString());

    if (!hasAccess) {
      return res.status(403).json({ message: 'Not authorized to delete this task' });
    }

    await task.deleteOne();

    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// addComment (already fixed in previous)
export const addComment = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text?.trim()) return res.status(400).json({ message: 'Comment required' });

    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const project = await Project.findById(task.project);
    const hasAccess = project.owner.toString() === req.user._id.toString() ||
                      project.members.some(m => m.toString() === req.user._id.toString());
    if (!hasAccess) return res.status(403).json({ message: 'Not authorized' });

    task.comments.push({
      text,
      user: req.user._id
    });
    task.commentCount = task.comments.length;
    await task.save();

    const populated = await Task.findById(task._id)
      .populate('comments.user', 'name email')
      .populate('assignee', 'name email')
      .populate('project', 'name color')
      .populate('createdBy', 'name email');

    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};