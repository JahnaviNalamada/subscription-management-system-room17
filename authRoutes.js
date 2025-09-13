const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const router = express.Router();
const { register, verifyOTP, login } = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/verify-otp', verifyOTP);
router.post('/login', login);
router.get("/google",passport.authenticate("google",{scope:["profile","email"]}));
router.get("/google/callback",passport.authenticate("google",{session:false}),(req,res)=>{
  try{
    const token=jwt.sign({id:req.user._id},process.env.JWT_SECRET,{expiresIn:process.env.JWT_EXPIRES_IN});
    res.redirect(`${process.env.CLIENT_URL}/google?token=${token}`);
  }catch(err){
    console.error("Google login error:",err);
    res.redirect(`${process.env.CLIENT_URL}/login?error=google_failed`);
  }}
);
router.get("/me",authMiddleware,async(req,res)=>{
  res.json({success:true,userId:req.userId});
})
router.get('/profile', authMiddleware, async (req, res) => {
  res.status(200).json({ message: `Authenticated user ID: ${req.userId}` });
});
router.get('/dashboard', authMiddleware, async (req, res) => {
  res.status(200).json({ message: `Welcome to your dashboard, user ${req.userId}` });
});

module.exports = router;
