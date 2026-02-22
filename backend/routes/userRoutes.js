import express from 'express';
import { getUsers, updateUser, deleteUser, updateProfile } from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';
import { adminProtect } from '../middleware/adminMiddleware.js';

const router = express.Router();

// Specific routes FIRST (fixed paths)
router.put('/profile', protect, updateProfile);       // ← MUST come BEFORE /:id

// Parameterized routes AFTER (catch-all :id)
router.get('/', adminProtect, getUsers);
router.put('/:id', adminProtect, updateUser);
router.delete('/:id', adminProtect, deleteUser);

export default router;