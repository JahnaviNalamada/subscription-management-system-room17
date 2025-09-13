const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User'); // ✅ Already has plugin

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: '/auth/google/callback'
    },
    async (accessToken, refreshToken, profile, cb) => {
      try {
        let user = await User.findOne(
          { googleId: profile.id });
          if(!user){
            user=await User.create({
              googleId:profile.id,
              username: profile.displayName,
              email: profile.emails[0].value,
              avatar: profile.photos[0].value,
              isLoggedIn:true,
              isVerified:true
          }
        )
          }
        return cb(null, user);
      } catch (error) {
        return cb(error, null);
      }
    }
  )
);