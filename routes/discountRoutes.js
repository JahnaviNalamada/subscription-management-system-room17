const express = require("express");
const router = express.Router();
const {
  createDiscount,
  getDiscounts,
  updateDiscount,
  deleteDiscount
} = require("../controllers/discountController");

router.post("/", createDiscount);
router.get("/", getDiscounts);
router.put("/:id", updateDiscount);
router.delete("/:id", deleteDiscount);

module.exports = router;
