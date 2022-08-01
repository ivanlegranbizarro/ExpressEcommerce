import express from 'express';
import {
  createReview,
  getReviewById,
  updateReview,
  deleteReview,
  getAllReviewsOfOneProduct,
} from '../controllers/reviewController.js';
import {
  authenticateUser,
  isOwnerOrAdmin,
} from '../middleware/authentication.js';

const router = express.Router();

router.post('/:id', authenticateUser, createReview);
router.get('/product/:id', getAllReviewsOfOneProduct);
router.get('/:id', getReviewById);
router.patch('/:id', authenticateUser, updateReview);
router.delete('/:id', isOwnerOrAdmin, deleteReview);

export default router;
