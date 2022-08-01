import jwt from 'jsonwebtoken';
import StatusCodes from 'http-status-codes';

/**
 * If the user has a token, verify it and if it's valid, add the decoded token to the request object
 * and call the next function. If the user doesn't have a token, send a 401 response
 * @param req - The request object.
 * @param res - the response object
 * @param next - This is a function that we call when we're done with our middleware.
 * @returns A function that takes in a request, response, and next.
 */
const authenticateUser = (req, res, next) => {
  const token = req.cookies.token;
  if (token) {
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      req.user = decoded;
      next();
    });
  } else {
    return res.status(401).json({ message: 'Unauthorized' });
  }
};

/**
 * It takes in a list of roles, and returns a function that takes in a request, response, and next
 * function. If the user's role is in the list of roles, then the next function is called. Otherwise,
 * the user is unauthorized
 * @param roles - an array of roles that are allowed to access the route
 * @returns A function that takes in 3 parameters.
 */
const checkIfAdmin = (...roles) => {
  return (req, res, next) => {
    if (roles.includes(req.user.role)) {
      next();
    } else {
      return res.status(401).json({ message: 'Unauthorized' });
    }
  };
};

/**
 * If the user is logged in and the userId in the token matches the userId in the URL, then the user is
 * authorized to perform the action
 * @param req - The request object
 * @param res - The response object
 * @param next - This is a function that is called when the middleware is complete.
 */
const isOwnerOrAdmin = (req, res, next) => {
  const token = req.cookies.token;
  if (token) {
    const user = jwt.verify(token, process.env.JWT_SECRET);
    if (user.userId === req.params.id || user.role === 'admin') {
      next();
    } else {
      res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ message: 'You are not authorized to perform this action' });
    }
  } else {
    res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ message: 'You are not authorized to perform this action' });
  }
};

export { authenticateUser, checkIfAdmin, isOwnerOrAdmin };
