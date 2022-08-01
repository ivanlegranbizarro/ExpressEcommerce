import User from '../models/User.js';
import StatusCodes from 'http-status-codes';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

/**
 * It gets all the users from the database and returns them in the response
 * @param req - The request object.
 * @param res - The response object.
 * @returns An array of users
 */
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ role: 'user' }).select('-hashedPassword');
    return res.status(StatusCodes.OK).json(users);
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error);
  }
};

/**
 * It finds a user by their id and returns the user's information, excluding their hashed password
 * @param req - The request object.
 * @param res - The response object.
 * @returns The user is being returned.
 */
const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-hashedPassword');
    return res.status(StatusCodes.OK).json(user);
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error);
  }
};

/**
 * It takes a request and a response, checks if there's a token in the request's cookies, if there is,
 * it verifies the token and returns the user's information
 * @param req - The request object.
 * @param res - the response object
 * @returns The user object is being returned.
 */
const showCurrentUser = async (req, res) => {
  try {
    const token = req.cookies.token;
    if (token) {
      const user = jwt.verify(token, process.env.JWT_SECRET);
      return res.status(StatusCodes.OK).json(user);
    }
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error);
  }
};

/**
 * It takes the user's id from the token, updates the user's name and email, and returns the updated
 * user
 * @param req - The request object.
 * @param res - The response object.
 * @returns The updated user
 */
const updateUser = async (req, res) => {
  const token = req.cookies.token;
  const user = jwt.verify(token, process.env.JWT_SECRET);
  const { name, email } = req.body;
  const updateUser = await User.findByIdAndUpdate(
    user.userId,
    {
      name,
      email,
    },
    { new: true, runValidators: true }
  );

  await updateUser.save();
  return res.status(StatusCodes.OK).json(updateUser);
};

/**
 * It updates the user's password if the old password is correct
 * @param req - The request object.
 * @param res - The response object.
 * @returns A function that takes in a request and response object.
 */
const updateUserPassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .send('Missing old or new password');
  }
  const user = await User.findById(req.user._id);
  const isPasswordCorrect = user.comparePassword(oldPassword);
  if (!isPasswordCorrect) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .send('Old password is incorrect');
  }
  user.hashedPassword = bcrypt.hashSync(newPassword, 10);
  await user.save();
  return res.status(StatusCodes.OK).send('Password updated');
};

export {
  getAllUsers,
  getUser,
  showCurrentUser,
  updateUser,
  updateUserPassword,
};
