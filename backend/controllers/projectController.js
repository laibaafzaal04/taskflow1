import Project from '../models/project.js';
import Task from '../models/task.js';

const calculateProgress = async (projectId) => {
  const tasks = await Task.find({ project: projectId });
  if (tasks.length === 0) return 0;
  const done = tasks.filter(t => t.status === 'done').length;
  return Math.round((done / tasks.length) * 100);
};

// Updated getProjects
export const getProjects = async (req, res) => {
  try {
    const projects = await Project.find({
      $or: [
        { owner: req.user._id },
        { members: req.user._id }
      ]
    })
    .populate('owner', 'name email')
    .populate('members', 'name email')
    .sort({ createdAt: -1 });

    // Add calculated progress to each
    const projectsWithProgress = await Promise.all(
      projects.map(async (p) => {
        const progress = await calculateProgress(p._id);
        return {
          ...p.toObject(),
          progress,
        };
      })
    );

    res.json(projectsWithProgress);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Updated getProjectById (similar)
export const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('owner', 'name email')
      .populate('members', 'name email');

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const hasAccess = project.owner.toString() === req.user._id.toString() ||
                     project.members.some(m => m.toString() === req.user._id.toString());

    if (!hasAccess) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const progress = await calculateProgress(project._id);
    res.json({
      ...project.toObject(),
      progress,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new project
// @route   POST /api/projects
// @access  Private
export const createProject = async (req, res) => {
  try {
    const { name, description, color, status, progress } = req.body;

    // Validation
    if (!name) {
      return res.status(400).json({ message: 'Project name is required' });
    }

    const project = await Project.create({
      name,
      description,
      color,
      status,
      progress,
      owner: req.user._id,
      members: [req.user._id]
    });

    const populated = await Project.findById(project._id)
      .populate('owner', 'name email')
      .populate('members', 'name email');

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private
export const updateProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if user has access (owner or member)
    const hasAccess = project.owner.toString() === req.user._id.toString() ||
                     project.members.some(m => m.toString() === req.user._id.toString());

    if (!hasAccess) {
      return res.status(403).json({ message: 'Not authorized to update this project' });
    }

    const { name, description, color, status, progress } = req.body;

    project.name = name || project.name;
    project.description = description !== undefined ? description : project.description;
    project.color = color || project.color;
    project.status = status || project.status;
    project.progress = progress !== undefined ? progress : project.progress;

    const updated = await project.save();
    const populated = await Project.findById(updated._id)
      .populate('owner', 'name email')
      .populate('members', 'name email');

    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private
export const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if user is owner
    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this project' });
    }

    // Delete all tasks in this project
    await Task.deleteMany({ project: project._id });

    // Delete project
    await project.deleteOne();

    res.json({ message: 'Project and associated tasks deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};