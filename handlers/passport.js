//this handler will just configure how we handle passport
const passport = require('passport');
const mongoose = require('mongoose');
const User = mongoose.model('User');

passport.use(User.createStrategy());// we can do this because, we used the plugin in User.js
// we need to tell passport, what to do with the user
// after passport logins, we want to pass on the actual user object, so we can do stuff specific to user
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
