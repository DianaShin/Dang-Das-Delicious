const express = require('express');
const router = express.Router();
const storeController = require('../controllers/storeController');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');
const reviewController = require('../controllers/reviewController');
const { catchErrors } = require('../handlers/errorHandlers');

router.get('/', catchErrors(storeController.getStores));
router.get('/stores/page/:page', catchErrors(storeController.getStores));
router.get('/stores', catchErrors(storeController.getStores));
router.get('/add', catchErrors(authController.isLoggedIn), storeController.addStore);

router.post('/add',
  storeController.upload,
  catchErrors(storeController.resize),
  catchErrors(storeController.createStore)
);

router.post('/add/:id',
  storeController.upload,
  catchErrors(storeController.resize),
  catchErrors(storeController.updateStore)
);
router.get('/stores/:id/edit', catchErrors(storeController.editStore));
router.get('/store/:slug', catchErrors(storeController.getStoreBySlug))

router.get('/tags', catchErrors(storeController.getStoresByTag));
router.get('/tags/:tag', catchErrors(storeController.getStoresByTag));

router.get('/login', userController.loginForm);
router.post('/login', authController.login);
router.get('/register', userController.registerForm);

// 1. Validate the registration data
// 2. Register the user - save to database
// 3. We need to log them in
router.post('/register',
  userController.validateRegister,
  userController.register,
  authController.login
);

router.get('/logout', authController.logout);

router.get('/account', authController.isLoggedIn, userController.account);
router.post('/account', catchErrors(userController.updateAccount));

router.post('/account/forgot', catchErrors(authController.forgot));
router.get('/account/reset/:token', catchErrors(authController.reset));
router.post('/account/reset/:token',
  authController.confirmedPasswords,
  catchErrors(authController.update)
);
router.get('/map', storeController.mapPage);
router.get('/hearts',
  authController.isLoggedIn,
  storeController.getHearts);
router.post('/reviews/:id',
  authController.isLoggedIn,
  catchErrors(reviewController.addReview));
router.get('/top', catchErrors(storeController.getTopStores));

/*
  API
*/

router.get('/api/search', catchErrors(storeController.searchStores));
router.get('/api/stores/near', catchErrors(storeController.mapStores));
router.post('/api/stores/:id/heart', catchErrors(storeController.heartStore));
module.exports = router;

/* From Module 1.4. Routing
// Do work here
router.get('/', (req, res) => {
  // const dshin = { name: 'Diana', age: 25, cool: true };
  // res.json(dshin);

  // res.send(req.query.name); // pulling from the url params
  // res.json(req.query); // shows the json from url params
  res.render('hello',  {
    name: 'diana',
    hobby: req.query.hobby,
    dog: 'husky',
    title: 'Sweet!'
  }); // the second parameter is an object of local variables that we can pass to pug
});

router.get('/reverse/:name', (req, res) => {
  const reverse = [ ...req.params.name].reverse().join('');
  // console.log([...req.params.name]);
  res.send(reverse);
});

module.exports = router;
*/
