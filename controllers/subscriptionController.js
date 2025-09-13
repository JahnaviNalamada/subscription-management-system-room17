const Subscription = require("../models/Subscription");

// Create subscription
exports.createSubscription = async (req, res) => {
  try {
    const { userId, planId, discountId } = req.body;
    const subscription = new Subscription({ userId, planId, discountId });
    await subscription.save();
    res.status(201).json({ success: true, data: subscription });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Get user's subscription
exports.getUserSubscription = async (req, res) => {
  try {
    const { userId } = req.params;
    const subscription = await Subscription.findOne({ userId, status: "active" })
      .populate("planId")
      .populate("discountId");
    res.status(200).json({ success: true, data: subscription });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Cancel subscription
exports.cancelSubscription = async (req, res) => {
  try {
    const { id } = req.params;
    const subscription = await Subscription.findByIdAndUpdate(
      id,
      { status: "cancelled", endDate: new Date() },
      { new: true }
    );
    res.status(200).json({ success: true, data: subscription });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
