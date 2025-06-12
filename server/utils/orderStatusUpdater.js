const Order = require('../models/Order');

const updateOrderStatuses = async () => {
  try {
    const orders = await Order.find({
      status: { $in: ['pending', 'preparing', 'ready', 'out_for_delivery'] }
    });

    const now = new Date();

    for (const order of orders) {
      const createdAt = new Date(order.createdAt);
      const timeElapsed = now.getTime() - createdAt.getTime(); // in milliseconds

      // Define time thresholds for status progression (in milliseconds)
      const PENDING_TO_PREPARING = 5 * 60 * 1000; // 5 minutes
      const PREPARING_TO_READY = 10 * 60 * 1000; // 10 minutes from creation
      const READY_TO_OUT_FOR_DELIVERY = 15 * 60 * 1000; // 15 minutes from creation
      const OUT_FOR_DELIVERY_TO_DELIVERED = 25 * 60 * 1000; // 25 minutes from creation

      if (order.status === 'pending' && timeElapsed >= PENDING_TO_PREPARING) {
        order.status = 'preparing';
        console.log(`Order ${order._id} status updated to preparing`);
      } else if (order.status === 'preparing' && timeElapsed >= PREPARING_TO_READY) {
        order.status = 'ready';
        console.log(`Order ${order._id} status updated to ready`);
      } else if (order.status === 'ready' && timeElapsed >= READY_TO_OUT_FOR_DELIVERY) {
        order.status = 'out_for_delivery';
        console.log(`Order ${order._id} status updated to out_for_delivery`);
      } else if (order.status === 'out_for_delivery' && timeElapsed >= OUT_FOR_DELIVERY_TO_DELIVERED) {
        order.status = 'delivered';
        order.paymentStatus = 'paid'; // Assuming payment is confirmed on delivery
        console.log(`Order ${order._id} status updated to delivered and payment to paid`);
      }

      if (order.isModified('status') || order.isModified('paymentStatus')) {
        await order.save();
      }
    }
  } catch (error) {
    console.error('Error updating order statuses:', error);
  }
};

module.exports = updateOrderStatuses; 