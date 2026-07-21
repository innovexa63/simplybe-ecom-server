const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const Order = require('../models/Order');
const Coupon = require('../models/Coupon');
// @desc    Create a Stripe Checkout Session
// @route   POST /api/payment/create-checkout-session
// @access  Private
const createCheckoutSession = async (req, res) => {
    try {
        const { cartItems, shippingAddress, customerName, phone, couponCode } = req.body;

        if (!cartItems || cartItems.length === 0) {
            return res.status(400).json({ message: 'Cart is empty' });
        }

        // Build Stripe line items from the cart
        const line_items = cartItems.map((item) => ({
            price_data: {
                currency: 'gbp',
                product_data: { name: item.name },
                unit_amount: Math.round(Number(item.price) * 100),
            },
            quantity: item.qty,
        }));

        // ── COUPON HANDLING ──
        // Frontend jai bolok, backend e abar validate kori (security)
        let discounts = [];
        let appliedCoupon = null;
        let discountAmount = 0;

        if (couponCode) {
            const subTotal = cartItems.reduce((sum, i) => sum + Number(i.price) * i.qty, 0);
            const coupon = await Coupon.findOne({ code: couponCode.toUpperCase().trim() });

            const isValid =
                coupon &&
                coupon.isActive &&
                (!coupon.expiryDate || new Date(coupon.expiryDate) >= new Date()) &&
                (coupon.usageLimit === null || coupon.usedCount < coupon.usageLimit) &&
                subTotal >= coupon.minOrderAmount;

            if (!isValid) {
                return res.status(400).json({ message: 'Coupon is not valid for this order' });
            }

            // Discount hishab
            if (coupon.discountType === 'percentage') {
                discountAmount = (subTotal * coupon.discountValue) / 100;
                if (coupon.maxDiscount !== null && discountAmount > coupon.maxDiscount) {
                    discountAmount = coupon.maxDiscount;
                }
            } else {
                discountAmount = coupon.discountValue;
            }
            if (discountAmount > subTotal) discountAmount = subTotal;
            discountAmount = Number(discountAmount.toFixed(2));

            // Stripe e ekta one-time coupon banai (amount_off diye, jate hishab exact thake)
            const stripeCoupon = await stripe.coupons.create({
                amount_off: Math.round(discountAmount * 100),
                currency: 'gbp',
                duration: 'once',
                name: coupon.code,
            });
            discounts = [{ coupon: stripeCoupon.id }];
            appliedCoupon = coupon.code;
        }

        const session = await stripe.checkout.sessions.create({
            mode: 'payment',
            line_items,
            discounts, // khali array hole Stripe uposhthiti dhorbe na
            success_url: `${process.env.CLIENT_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.CLIENT_URL}/payment/cancel`,
            metadata: {
                userId: req.user._id.toString(),
                customerName: customerName || req.user.name,
                phone: phone || '',
                shippingAddress: JSON.stringify(shippingAddress || {}),
                cartItems: JSON.stringify(cartItems),
                couponCode: appliedCoupon || '',
                discountAmount: String(discountAmount),
            },
        });

        res.json({ id: session.id, url: session.url });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Verify a completed session and create the order
// @route   GET /api/payment/verify/:sessionId
// @access  Private
const verifyCheckoutSession = async (req, res) => {
    try {
        const session = await stripe.checkout.sessions.retrieve(req.params.sessionId);

        if (session.payment_status !== 'paid') {
            return res.status(400).json({ message: 'Payment not completed' });
        }

        // Avoid creating a duplicate order if the success page is refreshed
        const existing = await Order.findOne({ 'paymentResult.id': session.id });
        if (existing) return res.json(existing);

        const meta = session.metadata || {};
        const cartItems = JSON.parse(meta.cartItems || '[]');
        const shippingAddress = JSON.parse(meta.shippingAddress || '{}');

        const orderItems = cartItems.map((i) => ({
            product: i.product,
            name: i.name,
            image: i.image,
            price: i.price,
            size: i.size,
            qty: i.qty,
        }));

        const totalPrice = session.amount_total / 100;
        const couponCode = meta.couponCode || null;
        const discountAmount = Number(meta.discountAmount || 0);

        // Coupon byabohar hole usedCount barai
        if (couponCode) {
            await Coupon.findOneAndUpdate(
                { code: couponCode },
                { $inc: { usedCount: 1 } }
            );
        }

        const order = await Order.create({
            user: meta.userId,
            customerName: meta.customerName,
            phone: meta.phone,
            shippingAddress,
            orderItems,
            totalPrice,
            couponCode,
            discountAmount,
            paymentMethod: 'Stripe',
            paymentStatus: 'Paid',
            isPaid: true,
            paidAt: new Date(),
            paymentResult: {
                id: session.id,
                status: session.payment_status,
                email_address: session.customer_details?.email,
            },
        });

        res.status(201).json(order);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { createCheckoutSession, verifyCheckoutSession };