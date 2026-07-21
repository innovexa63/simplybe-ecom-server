const Order = require('../models/Order');

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
const getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find({})
            .populate('user', 'name email')
            .sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get logged-in user's own orders
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Request a return/refund for own order
// @route   PUT /api/orders/:id/return
// @access  Private
const requestReturn = async (req, res) => {
    try {
        const { returnReason } = req.body;
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: 'Order not found' });

        // Make sure this order belongs to the logged-in user
        if (order.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized for this order' });
        }

        // Only delivered orders can be returned
        if (order.orderStatus !== 'Delivered') {
            return res.status(400).json({ message: 'Only delivered orders can be returned' });
        }

        // Prevent duplicate return requests
        if (order.returnStatus !== 'None') {
            return res.status(400).json({ message: 'Return already requested for this order' });
        }

        order.returnStatus = 'Requested';
        order.returnReason = returnReason || '';
        order.returnRequestedAt = new Date();

        const updated = await order.save();
        res.json(updated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private/Admin
const getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id).populate('user', 'name email');
        if (!order) return res.status(404).json({ message: 'Order not found' });
        res.json(order);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const createOrder = async (req, res) => {
    try {
        const { customerName, phone, shippingAddress, orderItems, totalPrice, paymentMethod, notes } = req.body;

        const order = await Order.create({
            user: req.user ? req.user._id : null,
            customerName,
            phone,
            shippingAddress,
            orderItems,
            totalPrice,
            paymentMethod: paymentMethod || 'COD',
            notes
        });

        res.status(201).json(order);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = async (req, res) => {
    try {
        const { orderStatus } = req.body;
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: 'Order not found' });

        order.orderStatus = orderStatus;
        if (orderStatus === 'Delivered') {
            order.isDelivered = true;
            order.deliveredAt = new Date();
        }

        const updated = await order.save();
        res.json(updated);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update payment status
// @route   PUT /api/orders/:id/pay
// @access  Private/Admin
const updatePaymentStatus = async (req, res) => {
    try {
        const { paymentStatus, paymentResult } = req.body;
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: 'Order not found' });

        order.paymentStatus = paymentStatus;
        if (paymentStatus === 'Paid') {
            order.isPaid = true;
            order.paidAt = new Date();
            order.paymentResult = paymentResult;
        }

        const updated = await order.save();
        res.json(updated);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete order
// @route   DELETE /api/orders/:id
// @access  Private/Admin
const deleteOrder = async (req, res) => {
    try {
        const order = await Order.findByIdAndDelete(req.params.id);
        if (!order) return res.status(404).json({ message: 'Order not found' });
        res.json({ message: 'Order deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Admin: approve or reject a return request
// @route   PUT /api/orders/:id/return-status
// @access  Private/Admin
const updateReturnStatus = async (req, res) => {
    try {
        const { returnStatus } = req.body; // 'Approved' or 'Rejected'
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: 'Order not found' });

        if (order.returnStatus !== 'Requested') {
            return res.status(400).json({ message: 'No pending return request for this order' });
        }

        order.returnStatus = returnStatus;

        // If approved, mark payment as refunded
        if (returnStatus === 'Approved') {
            order.paymentStatus = 'Refunded';
        }

        const updated = await order.save();
        res.json(updated);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
module.exports = { getAllOrders, getMyOrders, getOrderById, createOrder, updateOrderStatus, updatePaymentStatus, deleteOrder, requestReturn, updateReturnStatus };
