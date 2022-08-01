import express from 'express';
import dotenv from 'dotenv';
import errorHandlerMiddleware from './middleware/error-handler.js';
import notFound from './middleware/not-found.js';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import expressUploadfiles from 'express-fileupload';
dotenv.config();

/* This is the main file of the server. It is importing all the middleware and routes and starting the
server. */
const app = express();

/* Using the middleware. */
app.use(morgan('tiny'));
app.use(express.json());
app.use(cookieParser());
app.use(express.static('public'));

/* Importing the routes from the routes folder. */
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import productRoutes from './routes/productRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import orderRoutes from './routes/orderRoutes.js';

/* Importing the routes from the routes folder and using them in the server. */
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/reviews', reviewRoutes);
app.use('/api/v1/orders', orderRoutes);

/* Using the notFound and errorHandlerMiddleware middleware. */
app.use(notFound);
app.use(errorHandlerMiddleware);

/* Serving the static files in the public folder. */
app.use(express.static('./public'));
app.use(expressUploadfiles());

/* Importing the connectDB function from the connect.js file in the db folder. */
import connectDB from './db/connect.js';

/* Setting the port to the value of the PORT environment variable, or 3000 if the environment variable
is not set. */
const port = process.env.PORT || 3000;

/**
 * It connects to the database, then starts the server
 */
const start = async () => {
  try {
    await connectDB(process.env.MONGO_URL);
    app.listen(port, () => {
      console.log(`Server is listening on http://localhost:${port}`);
    });
  } catch (error) {
    console.log(error);
  }
};

start();
