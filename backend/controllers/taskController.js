import Task from '../models/task.js';
import Project from '../models/project.js';

// @desc    Get all tasks (filtered)
// @route   GET /api/tasks
// @access  Private
export const getTasks = async (req, res) => {
  try {
    const { projectId, status, priority, assignee } = req.query;
    let query = {};

    // Fix: skip project-membership restriction when fetching assigned tasks —
    // a member may be assigned to a task in a project they're not a member of
    const fetchingMyTasks = assignee === 'true';

    if (projectId) {
      query.project = projectId;
    } else if (req.user.role !== 'admin' && !fetchingMyTasks) {
      const userProjects = await Project.find({
        $or: [{ owner: req.user._id }, { members: req.user._id }]
      }).select('_id');
      query.project = { $in: userProjects.map(p => p._id) };
    }

    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (fetchingMyTasks) query.assignee = req.user._id;

    const tasks = await Task.find(query)
      .populate('assignee', 'name email')
      .populate('project', 'name color')
      .populate('createdBy', 'name email')
      .populate('comments.user', 'name email')
      .sort({ createdAt: -1 });

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single task
// @route   GET /api/tasks/:id
// @access  Private
export const getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignee', 'name email')
      .populate('project', 'name color')
      .populate('createdBy', 'name email')
      .populate('comments.user', 'name email');

    if (!task) return res.status(404).json({ message: 'Task not found' });

    // Fix: handle deleted project gracefully instead of crashing with TypeError
    const project = await Project.findById(task.project);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const hasAccess =
      req.user.role === 'admin' ||
      project.owner.toString() === req.user._id.toString() ||
      project.members.some(m => m.toString() === req.user._id.toString()) ||
      // Fix: assignees can always access their own tasks
      (task.assignee && task.assignee._id?.toString() === req.user._id.toString());

    if (!hasAccess) return res.status(403).json({ message: 'Not authorized to access this task' });

    res.json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new task
// @route   POST /api/tasks
// @access  Private
export const createTask = async (req, res) => {
  try {
    const { title, description, project, priority, status, dueDate, assignee } = req.body;

    if (!title || !project) {
      return res.status(400).json({ message: 'Title and project are required' });
    }

    const proj = await Project.findById(project);
    if (!proj) return res.status(404).json({ message: 'Project not found' });

    const hasAccess =
      req.user.role === 'admin' ||
      proj.owner.toString() === req.user._id.toString() ||
      proj.members.some(m => m.toString() === req.user._id.toString());

    if (!hasAccess) {
      return res.status(403).json({ message: 'Not authorized to add tasks to this project' });
    }

    const task = await Task.create({
      title,
      description,
      project,
      priority,
      status,
      assignee: assignee || null,
      dueDate: dueDate ? new Date(dueDate) : null,
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

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Private
export const updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const project = await Project.findById(task.project);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const hasAccess =
      req.user.role === 'admin' ||
      project.owner.toString() === req.user._id.toString() ||
      project.members.some(m => m.toString() === req.user._id.toString()) ||
      (task.assignee && task.assignee.toString() === req.user._id.toString());

    if (!hasAccess) return res.status(403).json({ message: 'Not authorized' });

    const { title, description, assignee, priority, status, dueDate } = req.body;

    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (assignee !== undefined) task.assignee = assignee || null;
    if (priority !== undefined) task.priority = priority;
    if (status !== undefined) task.status = status;
    if (dueDate !== undefined) task.dueDate = dueDate ? new Date(dueDate) : null;

    await task.save();

    const populated = await Task.findById(task._id)
      .populate('assignee', 'name email')
      .populate('project', 'name color')
      .populate('createdBy', 'name email')
      .populate('comments.user', 'name email');

    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private
export const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const project = await Project.findById(task.project);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const hasAccess =
      req.user.role === 'admin' ||
      project.owner.toString() === req.user._id.toString();

    if (!hasAccess) return res.status(403).json({ message: 'Not authorized' });

    await task.deleteOne();
    res.json({ message: 'Task deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add comment to task
// @route   POST /api/tasks/:id/comment
// @access  Private
export const addComment = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ message: 'Comment text is required' });
    }

    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const project = await Project.findById(task.project);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    // Fix: assignees can comment on their tasks even if not a project member
    const hasAccess =
      req.user.role === 'admin' ||
      project.owner.toString() === req.user._id.toString() ||
      project.members.some(m => m.toString() === req.user._id.toString()) ||
      (task.assignee && task.assignee.toString() === req.user._id.toString());

    if (!hasAccess) return res.status(403).json({ message: 'Not authorized' });

    task.comments.push({ text: text.trim(), user: req.user._id });
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