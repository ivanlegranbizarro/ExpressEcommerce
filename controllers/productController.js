import Product from '../models/Product.js';
import StatusCodes from 'http-status-codes';
import path from 'path';

/**
 * It creates a new product and returns it
 * @param req - The request object.
 * @param res - The response object.
 */
const createProduct = async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(StatusCodes.CREATED).json(product);
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error);
  }
};

/**
 * It's an async function that uses the Product model to find all products in the database and returns
 * them in a JSON response
 * @param req - The request object.
 * @param res - The response object.
 * @returns An array of all products in the database.
 */
const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find();
    return res.status(StatusCodes.OK).json(products);
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error);
  }
};

/**
 * It finds a product by its id and returns it
 * @param req - The request object.
 * @param res - The response object.
 * @returns The product with the id that was passed in the request.
 */
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('reviews');
    return res.status(StatusCodes.OK).json(product);
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error);
  }
};

/**
 * It finds a product by its id and updates it with the data in the request body
 * @param req - The request object.
 * @param res - The response object.
 * @returns The product is being returned.
 */
const updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    await product.save();
    return res.status(StatusCodes.OK).json(product);
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error);
  }
};

/**
 * It finds a product by its id, removes it (and it removes its review's associated),
 * and sends a response to the client
 * @param req - The request object. This contains information about the HTTP request that raised the
 * event.
 * @param res - The response object.
 */
const deleteProduct = async (req, res) => {
  try {
    const product = Product.findById(req.params.id);
    await product.remove();

    res.status(StatusCodes.NO_CONTENT).json({ message: 'Product deleted' });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error);
  }
};

/**
 * It uploads a product image to the server
 * @param req - The request object.
 * @param res - The response object.
 * @returns The image name is being returned.
 */
const uploadProductImage = async (req, res) => {
  try {
    if (!req.files) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: 'No files were uploaded.' });
    }
    const productImage = req.files.image;
    if (!productImage.mimetype.startsWith('image')) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: 'The file must be an image.' });
    }
    const maxSize = 1024 * 1024;
    if (productImage.size > maxSize) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: 'The image must be less than 1MB.' });
    }
    const imagePath = path.join(
      __dirname,
      '../public/uploads/' + productImage.name
    );
    await productImage.mv(imagePath);
    return res.status(StatusCodes.OK).json({ image: productImage.name });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error);
  }
};

export {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  uploadProductImage,
};
