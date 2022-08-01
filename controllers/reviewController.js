import Review from '../models/Review.js';
import jwt from 'jsonwebtoken';
import StatusCodes from 'http-status-codes';

/**
 * It creates a new review for a product
 * @param req - The request object.
 * @param res - The response object.
 * @returns The new review is being returned.
 */
const createReview = async (req, res) => {
  try {
    const token = req.cookies.token;
    const userToken = jwt.verify(token, process.env.JWT_SECRET);
    const user = userToken.userId;
    const product = req.params.id;
    const review = req.body;
    const newReview = new Review({
      user: user,
      product: product,
      title: review.title,
      comment: review.comment,
      rating: review.rating,
    });


    await newReview.save();
    return res.status(StatusCodes.OK).json(newReview);
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error);
  }
};

/**
 * It gets all the reviews of a product
 * @param req - The request object.
 * @param res - The response object.
 * @returns An array of reviews
 */
const getAllReviewsOfOneProduct = async (req, res) => {
  try {
    const product = req.params.id;
    const reviews = await Review.find({ product: product })
      .populate('user', 'name')
      .populate('product', 'name');

    return res.status(StatusCodes.OK).json(reviews);
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error);
  }
};

/**
 * It finds a review by its id and returns it
 * @param req - The request object.
 * @param res - The response object.
 * @returns The review with the id that matches the id in the request params.
 */
const getReviewById = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id)
      .populate('user', 'name')
      .populate('product', 'name');
    return res.status(StatusCodes.OK).json(review);
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error);
  }
};

/**
 * It finds a review by its id and updates it with the new data
 * @param req - The request object.
 * @param res - The response object.
 * @returns The updated review
 */
const updateReview = async (req, res) => {
  try {
    await Review.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    return res.status(StatusCodes.OK).json({ message: 'Review updated' });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error);
  }
};

/**
 * It finds a review by its id and deletes it
 * @param req - The request object. This contains information about the HTTP request that raised the
 * event.
 * @param res - The response object.
 * @returns The review is being deleted from the database.
 */
const deleteReview = async (req, res) => {
  try {
    await Review.findByIdAndDelete(req.params.id);
    return res.status(StatusCodes.OK).json({ message: 'Review deleted' });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error);
  }
};

export {
  createReview,
  getAllReviewsOfOneProduct,
  getReviewById,
  updateReview,
  deleteReview,
};
