import express from 'express';
import {
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrder,
  deleteOrder,
  getCurrentUserOrders,
} from '../controllers/orderController.js';

import {
  authenticateUser,
  isOwnerOrAdmin,
  checkIfAdmin,
} from '../middleware/authentication.js';

const router = express.Router();

router.post('/', authenticateUser, createOrder);
router.get('/', authenticateUser, checkIfAdmin('admin'), getAllOrders);
router.get('/:id', authenticateUser, isOwnerOrAdmin, getOrderById);
router.get('/user/:id', authenticateUser, getCurrentUserOrders);
router.patch('/:id', authenticateUser, checkIfAdmin, updateOrder);
router.delete('/:id', authenticateUser, checkIfAdmin, deleteOrder);

export default router;
