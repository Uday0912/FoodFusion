const Payment = require('../models/Payment');
const Order = require('../models/Order');

// @desc    Create payment
// @route   POST /api/payments
// @access  Private
exports.createPayment = async (req, res) => {
  try {
    const { orderId, paymentMethod } = req.body;

    // Find the order
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if order belongs to user
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    // Create payment record
    const payment = new Payment({
      order: order._id,
      user: req.user._id,
      amount: order.totalAmount,
      paymentMethod,
      transactionId: `TXN${Date.now()}${Math.floor(Math.random() * 1000)}`
    });

    await payment.save();

    // Simulate payment processing
    setTimeout(async () => {
      payment.status = 'completed';
      await payment.save();

      // Update order payment status
      order.paymentStatus = 'paid';
      order.status = 'preparing';
      await order.save();
    }, 2000);

    res.status(201).json({
      message: 'Payment initiated successfully',
      payment
    });
  } catch (error) {
    console.error('Error creating payment:', error);
    res.status(500).json({ 
      message: 'Error creating payment',
      error: error.message 
    });
  }
};

// @desc    Get payment details
// @route   GET /api/payments/:orderId
// @access  Private
exports.getPaymentDetails = async (req, res) => {
  try {
    const payment = await Payment.findOne({ order: req.params.orderId })
      .populate('order', 'totalAmount status')
      .populate('user', 'name email');

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    // Check if payment belongs to user
    if (payment.user._id.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    res.json(payment);
  } catch (error) {
    console.error('Error fetching payment details:', error);
    res.status(500).json({ 
      message: 'Error fetching payment details',
      error: error.message 
    });
  }
};

// @desc    Initiate refund
// @route   POST /api/payments/:paymentId/refund
// @access  Private
exports.initiateRefund = async (req, res) => {
  try {
    const { reason } = req.body;
    const payment = await Payment.findById(req.params.paymentId);

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    // Check if payment belongs to user
    if (payment.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    // Check if payment is completed
    if (payment.status !== 'completed') {
      return res.status(400).json({ message: 'Can only refund completed payments' });
    }

    // Initiate refund through Razorpay
    const refund = await razorpay.payments.refund(payment.razorpayPaymentId, {
      amount: payment.amount * 100 // Convert to paise
    });

    // Update payment record
    payment.status = 'refunded';
    payment.refundAmount = payment.amount;
    payment.refundReason = reason;
    await payment.save();

    // Update order status
    const order = await Order.findById(payment.order);
    order.paymentStatus = 'refunded';
    await order.save();

    res.json({ 
      message: 'Refund initiated successfully',
      refund
    });
  } catch (error) {
    console.error('Error initiating refund:', error);
    res.status(500).json({ 
      message: 'Error initiating refund',
      error: error.message 
    });
  }
}; 