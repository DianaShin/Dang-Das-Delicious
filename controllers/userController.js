const mongoose = require('mongoose');
const User = mongoose.model('User'); // we can do this because we already imported in start.js
const promisify = require('es6-promisify');

exports.loginForm = (req, res) => {
  res.render('login', { title: 'Login' });
}

exports.registerForm = (req, res) => {
  res.render('register', { title: 'Register' });
}

exports.validateRegister = (req, res, next) => {
  req.sanitizeBody('name');
  // sanitizeBody comes from expressValidator which we had added to app in app.js
  req.checkBody('name', 'You must supply a name!').notEmpty();
  req.checkBody('email', 'That email is not valid!').isEmail();
  req.sanitizeBody('email').normalizeEmail({
    remove_dots: false,
    remove_extension: false,
    gmail_remove_subaddress: false,
  });
  req.checkBody('password', 'Password cannot be blank!').notEmpty();
  req.checkBody('password-confirm', 'Confirmed Password cannot be blank!').notEmpty();
  req.checkBody('password-confirm', 'Opps! Your passwords do not match!').equals(req.body.password);

  // by calling validationErrors, it will check all the above validations and put then into an error obj
  const errors = req.validationErrors();
  if (errors) {
    req.flash('error', errors.map(err => err.msg));
    res.render('register', { title: Register, body: req.body,
      flashes: req.flash() })
    return; // stop the fn from running
  }
  next(); // there were no errors
}

exports.register = async (req, res, next) => {
  const user = new User({ email: req.body.email, name: req.body.name });
  // we use the method 'register' instead of 'save', because register will take the password, hash it, and then save it to database
  // the method 'register' is available to us through passportLocalMongoose, which we used as a plugin on the User Schema
  // NOTE: the problem: 'register' method doesn't return a promise; it is callback-based
  // so we will use a promisify library, which will take older callback-based function
  // into a promise based function, so we can use async... await
  // User.register(user, req.body.password, function(err, user) {
  //
  // })
  const register = promisify(User.register, User); // second parameter is which object to bind to
  await register(user, req.body.password);
  next(); // pass to authController
};

exports.account = (req, res) => {
  res.render('account', {title: 'Edit Your Account'} );
};

exports.updateAccount = async (req, res) => {
  const updates = {
    name: req.body.name,
    email: req.body.email
  };
  const user = await User.findOneAndUpdate(
    { _id: req.user._id },
    { $set: updates },
    { new: true, runValidators: true, context: 'query'}
  ); // the parameters are query, update, options that allows us to run validators
  req.flash('success', 'Updated the profile!')
  res.redirect('back'); //redirects user back to the page they came from - same as redirect to /account heree
};
