const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/authMiddleware');
const {
  createPayment,
  getPaymentDetails
} = require('../controllers/paymentController');

// @route   POST /api/payments
// @desc    Create payment
// @access  Private
router.post('/', auth, createPayment);

// @route   GET /api/payments/:orderId
// @desc    Get payment details
// @access  Private
router.get('/:orderId', auth, getPaymentDetails);

module.exports = router; 