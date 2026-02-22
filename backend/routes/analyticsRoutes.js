import express from 'express';
import { getAnalytics } from '../controllers/analyticsController.js';
import { adminProtect } from '../middleware/adminMiddleware.js';

const router = express.Router();

router.get('/', adminProtect, getAnalytics);

export default router;