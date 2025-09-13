const express = require("express");
const router = express.Router();
const {
  createSubscription,
  getUserSubscription,
  cancelSubscription
} = require("../controllers/subscriptionController");

router.post("/", createSubscription);
router.get("/:userId", getUserSubscription);
router.put("/:id/cancel", cancelSubscription);

module.exports = router;
