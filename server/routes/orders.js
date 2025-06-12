const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/authMiddleware');
const {
  createOrder,
  getUserOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
  deleteOrder,
  rateOrder,
  updatePaymentStatus
} = require('../controllers/orderController');

// @route   POST /api/orders
// @desc    Create new order
// @access  Private
router.post('/', auth, createOrder);

// @route   GET /api/orders
// @desc    Get user orders
// @access  Private
router.get('/', auth, getUserOrders);

// @route   PUT /api/orders/:id/status
// @desc    Update order status
// @access  Private
router.put('/:id/status', auth, updateOrderStatus);

// @route   PUT /api/orders/:id/cancel
// @desc    Cancel order
// @access  Private
router.put('/:id/cancel', auth, cancelOrder);

// @route   DELETE /api/orders/:id
// @desc    Delete order
// @access  Private
router.delete('/:id', auth, deleteOrder);

// @route   GET /api/orders/:id
// @desc    Get order by ID
// @access  Private
router.get('/:id', auth, getOrderById);

// @route   POST /api/orders/:id/rate
// @desc    Rate order
// @access  Private
router.post('/:id/rate', auth, rateOrder);

// @route   PUT /api/orders/:id/payment
// @desc    Update payment status
// @access  Private
router.put('/:id/payment', auth, updatePaymentStatus);

module.exports = router; 