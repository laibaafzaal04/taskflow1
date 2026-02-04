import express from 'express';

import {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
    addComment
} from '../controllers/taskController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, getTasks)
  .post(protect, createTask);

router.route('/:id')
  .get(protect, getTaskById)
  .put(protect, updateTask)
  .delete(protect, deleteTask);

router.route('/:id/comment').post(protect, addComment);

export default router;