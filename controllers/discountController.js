const Discount = require("../models/Discount");

// Create discount
exports.createDiscount = async (req, res) => {
  try {
    const discount = new Discount(req.body);
    await discount.save();
    res.status(201).json({ success: true, data: discount });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Get all discounts
exports.getDiscounts = async (req, res) => {
  try {
    const discounts = await Discount.find();
    res.status(200).json({ success: true, data: discounts });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Update discount
exports.updateDiscount = async (req, res) => {
  try {
    const { id } = req.params;
    const discount = await Discount.findByIdAndUpdate(id, req.body, { new: true });
    res.status(200).json({ success: true, data: discount });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Delete discount
exports.deleteDiscount = async (req, res) => {
  try {
    const { id } = req.params;
    await Discount.findByIdAndDelete(id);
    res.status(200).json({ success: true, message: "Discount deleted" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
