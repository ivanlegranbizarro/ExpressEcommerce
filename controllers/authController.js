import User from '../models/User.js';
import StatusCodes from 'http-status-codes';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

/**
 * It creates a new user and returns a JWT token
 * @param req - The request object.
 * @param res - the response object
 * @returns The user object is being returned.
 */
const register = async (req, res) => {
  const { email, name, password } = req.body;
  if (await User.findOne({ email })) {
    res.status(StatusCodes.CONFLICT).json({
      message: 'User with this email already exists',
    });
    return;
  }
  // first registered user is admin
  const isFirstAccount = (await User.countDocuments()) === 0;
  const role = isFirstAccount ? 'admin' : 'user';

  // hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // create user
  const user = new User({ email, name, hashedPassword, role });

  const tokenUser = { name: user.name, userId: user._id, role: user.role };
  const token = jwt.sign(tokenUser, process.env.JWT_SECRET, {
    expiresIn: '1h',
  });

  try {
    await user.save();
    res
      .status(StatusCodes.CREATED)
      .cookie('token', token, {
        httpOnly: true,
        expires: new Date(Date.now() + 1000 * 60 * 60 * 24),
      })
      .send({ user: tokenUser });
  } catch (error) {
    res.status(StatusCodes.BAD_REQUEST).send(error);
  }
};

/**
 * It takes the email and password from the request body, checks if they are present, finds the user in
 * the database, checks if the password is valid, and if it is, it creates a token and sends it back to
 * the client
 * @param req - The request object.
 * @param res - The response object.
 * @returns The user object is being returned.
 */
const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(StatusCodes.BAD_REQUEST).send({
      message: 'Email and password are required',
    });
    return;
  }
  const user = await User.findOne({ email });
  if (!user) {
    res.status(StatusCodes.NOT_FOUND).send({
      message: 'Invalid credentials',
    });
    return;
  }
  const isPasswordValid = await bcrypt.compare(password, user.hashedPassword);
  if (!isPasswordValid) {
    res.status(StatusCodes.NOT_FOUND).send({
      message: 'Invalid credentials',
    });
    return;
  }
  const tokenUser = { name: user.name, userId: user._id, role: user.role };
  const token = jwt.sign(tokenUser, process.env.JWT_SECRET, {
    expiresIn: '1h',
  });
  res
    .status(StatusCodes.OK)
    .cookie('token', token, {
      httpOnly: true,
      expires: new Date(Date.now() + 1000 * 60 * 60 * 24),
    })
    .send({ user: tokenUser });
};

/**
 * It clears the cookie and sends a message to the client about the logout
 * @param req - The request object.
 * @param res - The response object.
 */
const logout = async (req, res) => {
  res.clearCookie('token');
  res.status(StatusCodes.OK).send({ message: 'Logged out' });
};

export { register, login, logout };
