import express from 'express';
import {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  uploadProductImage,
} from '../controllers/productController.js';

import {
  authenticateUser,
  checkIfAdmin,
} from '../middleware/authentication.js';

const router = express.Router();

router.post('/', authenticateUser, checkIfAdmin('admin'), createProduct);
router.get('/', getAllProducts);
router.get('/:id', getProductById);
router.patch('/:id', authenticateUser, checkIfAdmin('admin'), updateProduct);
router.delete('/:id', authenticateUser, checkIfAdmin('admin'), deleteProduct);
router.post(
  '/:id/image',
  authenticateUser,
  checkIfAdmin('admin'),
  uploadProductImage
);

export default router;
