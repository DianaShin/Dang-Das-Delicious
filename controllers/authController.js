const passport = require('passport'); // library we are using to log users in
// we need to be able to send passport data so it can tell us whether we should be logged in or not
// strategy: something that will interface with checking whether you should be allowed to log in
// we are using a local strategy, which just checks if username and password has been sent correctly

const crypto = require('crypto'); // this is module built into Node.JS that allows us to get cryptographically secure random strings
const mongoose = require('mongoose');
const User = mongoose.model('User');
// creating a middleware - it looks different from our other middleware because taking advantage of passport
const promisify = require('es6-promisify');
const mail = require('../handlers/mail');

exports.login = passport.authenticate('local', {
  failureRedirect: '/login',
  failureFlash: 'Failed Login!',
  successRedirect: '/',
  successFlash: 'You are now logged in!'
}); // second paramter is a config object

exports.logout = (req, res) => {
  req.logout();
  req.flash('success', 'You are now logged out.👋')
  res.redirect('/');
}
// Passport exposes a logout() function on req (also aliased as logOut()) that
// can be called from any route handler which needs to terminate a login session.
// Invoking logout() will remove the req.user property and clear the login session (if any).

exports.isLoggedIn = (req, res, next) => {
  // first check if the user is authenticated
  if (req.isAuthenticated()) {
    next();
    return;
  }
  req.flash('error', 'Oops you must be logged in');
  res.redirect('/login');
}

exports.forgot = async (req, res) => {
  // 1. see if a user with that email exists
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    req.flash('error', 'No account with that email exists!');
    return res.redirect('/login');
  }
  // 2. if user exists, set reset token and expiration token on their account
  user.resetPasswordToken = crypto.randomBytes(20).toString('hex'); //this puts the reset token on user
  user.resetPasswordExpires = Date.now() + 3600000; // one hour from now
  await user.save();
  // 3. Send user an email with the token
  const resetURL = `http://${req.headers.host}/account/reset/${user.resetPasswordToken}`
  await mail.send({
    user,
    subject: 'Password Reset',
    resetURL: resetURL,
    filename: 'password-reset', //will look for password-reset pug file
  })
  req.flash('success', `You have been emailed a password reset link.`);
  // 4. Redirect to the login
  res.redirect('/login');
};

exports.reset = async (req, res) => {
  const user = await User.findOne({
    resetPasswordToken: req.params.token,
    resetPasswordExpires: { $gt: Date.now()}
  }); //$gt is for greater than in mongodb
  if (!user) {
    req.flash('error', 'Password reset is invalid or has expired')
    return res.redirect('/login');
  }
  // if there is a user, show the redirect password form
  res.render('reset', { title: 'Reset your Password'})
}

exports.confirmedPasswords = (req, res, next) => {
  if (req.body.password === req.body['password-confirm']) {
    // the above is how you access a property with a dash inside of it - use square brackets and pass the property as a string
    next(); //keep it going
    return;
  }
  req.flash('error', 'Passwords do not match!');
  res.redirect('back');
}

exports.update = async (req, res) => {
  const user = await User.findOne({
    resetPasswordToken: req.params.token,
    resetPasswordExpires: { $gt: Date.now()}
  });
  if (!user) {
    req.flash('error', 'Password reset is invalid or has expired')
    return res.redirect('/login');
  }
  //NOTE: setPassword() is made available to us from the plugin in User.js, HOWEVER, it is callback-based, so will use promisify
  const setPassword = promisify(user.setPassword, user);
  await setPassword(req.body.password);
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined; // setting a value to undefined is how you get rid of a property in mongodb
  const updatedUser = await user.save();
  await req.login(updatedUser); // login() from passport.js
  req.flash('success', 'Password has been updated!');
  res.redirect('/');
}
