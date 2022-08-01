import express from 'express';
import {
  getAllUsers,
  getUser,
  showCurrentUser,
  updateUser,
  updateUserPassword,
} from '../controllers/userController.js';
import {
  authenticateUser,
  checkIfAdmin,
  isOwnerOrAdmin,
} from '../middleware/authentication.js';

const router = express.Router();

/* This is a router that is used to route the user to the correct page. */
router.route('/').get(authenticateUser, checkIfAdmin('admin'), getAllUsers);
router.route('/showMe').get(authenticateUser, showCurrentUser);
router.route('/updateUser').patch(authenticateUser, updateUser);
router.route('/updateUserPassword').patch(authenticateUser, updateUserPassword);
router.route('/:id').get(authenticateUser, isOwnerOrAdmin, getUser);

export default router;
