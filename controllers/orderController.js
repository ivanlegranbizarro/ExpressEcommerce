import StatusCodes from 'http-status-codes';
import Product from '../models/Product.js';
import Order from '../models/Order.js';

const createOrder = async (req, res) => {
  try {
    const { items: cartItems, tax, shippingFee } = req.body;
    if (!cartItems || !tax || !shippingFee) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: 'Missing required fields',
      });
    }
    let orderItems = [];
    let subtotal = 0;
    for (const item of cartItems) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          message: 'Invalid product',
        });
      }
      const orderItem = {
        product: item.product,
        price: product.price,
        amount: item.amount,
        image: product.image,
      };
      orderItems.push(orderItem);
      subtotal += product.price * item.amount;
    }
    return res.status(StatusCodes.OK).json({
      orderItems,
      subtotal,
      tax,
      shippingFee,
      total: subtotal + tax + shippingFee,
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error);
  }
};

const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find();
    return res.status(StatusCodes.OK).json({ orders, count: orders.length });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error);
  }
};

const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(StatusCodes.NOT_FOUND).json({
        message: 'Order not found',
      });
    }
    return res.status(StatusCodes.OK).json(order);
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error);
  }
};

const getCurrentUserOrders = async (req, res) => {
  try {
    const token = req.cookies.token;
    const user = jwt.verify(token, process.env.JWT_SECRET);
    const orders = await Order.find({ user: user.userId });
    return res.status(StatusCodes.OK).json(orders);
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error);
  }
};

/**
 * It updates the order with the paymentIntentId and sets the status to processing
 * @param req - The request object. This contains information about the HTTP request that raised the
 * event.
 * @param res - The response object.
 * @returns The order is being returned.
 */
const updateOrder = async (req, res) => {
  try {
    const { paymentIntentId } = req.body;
    const order = await Order.findByIdAndUpdate(req.params.id, req.body);
    if (!order) {
      return res.status(StatusCodes.NOT_FOUND).json({
        message: 'Order not found',
      });
    }

    const token = req.cookies.token;
    const user = jwt.verify(token, process.env.JWT_SECRET);
    if (order.user.toString() !== user.userId) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        message: 'Unauthorized',
      });
    }

    order.paymentIntentId = paymentIntentId;
    order.status = 'processing';
    await order.save();
    return res.status(StatusCodes.OK).json(order);
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error);
  }
};

/**
 * It deletes an order if the user is authorized to do so
 * @param req - The request object.
 * @param res - The response object.
 * @returns The order is being returned.
 */
const deleteOrder = async (req, res) => {
  try {
    const token = req.cookies.token;
    const user = jwt.verify(token, process.env.JWT_SECRET);
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(StatusCodes.NOT_FOUND).json({
        message: 'Order not found',
      });
    }
    if (order.user.toString() !== user.userId) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        message: 'Unauthorized',
      });
    }
    await order.remove();
    return res.status(StatusCodes.OK).json({ message: 'Order deleted' });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error);
  }
};

export {
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrder,
  getCurrentUserOrders,
  deleteOrder,
};
