import { protect } from './authMiddleware.js';

export const adminProtect = async (req, res, next) => {
  protect(req, res, async (err) => {
    if (err) return next(err);
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    next();
  });
};