const mongoose = require('mongoose');
const Store = mongoose.model('Store');
const User = mongoose.model('User');
const multer = require('multer');
const jimp = require('jimp'); // resizes photo
const uuid = require('uuid'); // gives unique identifiers

const multerOptions = {
  storage: multer.memoryStorage(),
  fileFilter(req, file, next) {
    const isPhoto = file.mimetype.startsWith('image');
    if (isPhoto) {
      next(null, true); //first arg would normally be error, here we are saying all good
    } else {
      next({ message: 'That filetype isn\'t allowed! '}, false);
    }
  }
};

// exports.myMiddleware = (req, res, next) => {
//   req.name = 'Diana';
//   // res.cookie('name', 'Diana is awesome', {maxAge: 9000}) if you need to set cookies
//   // if (req.name === 'Diana') {
//   //   throw Error('Who do u think u are?');
//   // }
//   next();
// };

exports.homePage = (req, res) => {
  // req.flash('success', 'yay!!')
  res.render('index', { title: 'Sweet!' });
};

exports.addStore = (req, res) => {
  res.render('editStore', { title: 'Add Store'});
};

//middleware for upload
exports.upload = multer(multerOptions).single('photo'); // we want a single field named 'photo'

exports.resize = async (req, res, next) => {
  // check if there is no new file to resize
  if (!req.file) {
    next(); // skip to the next middleware
    return;
  }
  const extension = req.file.mimetype.split('/')[1];
    req.body.photo = `${uuid.v4()}.${extension}`;
    // now we resize
    const photo = await jimp.read(req.file.buffer);
    await photo.resize(800, jimp.AUTO);
    await photo.write(`./public/uploads/${req.body.photo}`);
    // once we have written the photo to our filesystem, keep going!
    next();
}

exports.createStore = async (req, res) => {
  req.body.author = req.user._id;
  const store = await (new Store(req.body)).save(); //this way we can add the slug property after save for use in line 25
  await store.save();
  req.flash('success', `Successfully Created ${store.name}. Wanna leave a review?`)
  res.redirect(`/store/${store.slug}`);
};

exports.getStores = async (req, res) => {
  const page = req.params.page || 1;
  const limit = 4;
  const skip = page * limit - limit;
  // 1. query the database for a list of all stores
  const storesPromise = Store
    .find()
    .skip(skip)
    .limit(limit)
    .sort({ created: 'desc' });
  // console.log(stores);

  const countPromise = Store.count();

  const [stores, count] = await Promise.all([storesPromise, countPromise ]);
  const pages = Math.ceil(count/limit);
  if (!stores.length && skip) {
    req.flash('info', `Hey! You asked for page ${page}. That page dun exist. So I put you on page ${pages}.`)
    res.redirect(`/stores/page/${pages}`);
    return;
  }
  res.render('stores', { title: 'Stores', stores: stores, page, pages, count }); // passing stores to the pug template
}

const confirmOwner = (store, user) => {
  if(!store.author.equals(user._id)) {
    throw Error('You must own a store in order to edit it!');
  }
}

exports.editStore = async (req, res) => {
  // 1. find the store given the id
  const store = await Store.findOne({ _id: req.params.id }); //findOne, find doesn't return data; it returns a Promise; that is why you need AWAIT
  // 2. confirm that they are the owner of the store
  confirmOwner(store, req.user);
  // render out the edit form so the user can update their store
  res.render('editStore', { title: `Edit ${store.name}`, store: store });
}

exports.updateStore = async ( req, res) => {
  // set location data to be a point
  req.body.location.type = 'Point';
  // find and update the store
  const store = await Store.findOneAndUpdate({ _id: req.params.id }, req.body, {
    new: true, // returns the new, updated store, instead of the old one
    runValidators: true,
  }).exec(); // findOneAndUpdate takes three parameters: query, data, options
             // exec() runs the query
  req.flash('success', `Successfully updated <strong>${store.name}</strong>. <a href="/store/${store.slug}">View Store </a>`);
  res.redirect(`/stores/${store._id}/edit`);
}

exports.getStoreBySlug = async (req, res, next) => {
  const store = await Store.findOne({ slug: req.params.slug }).
    populate('author reviews'); //populate will populate the author with the full object, instead of just the ObjectId
  if (!store) return next();
  res.render('store', { title: store.name, store: store });
}

exports.getStoresByTag = async (req, res) => {
  // const tags = await Store.getTagsList(); // method we added onto the Store schema
  const tag = req.params.tag;
  const tagQuery = tag || { $exists: true }; // if tag is not in the params, will return to us, every single store with any tag
  const tagsPromise = Store.getTagsList();
  const storesPromise = Store.find({ tags: tagQuery });
  const [tags, stores] = await Promise.all([ tagsPromise, storesPromise ]); // we are destructing the 'result' into an array [tags, stores]
  // the way to wait for all promises to come back and then do something is Promise.all
  // res.json(result);
  res.render('tag', { tags: tags, title: 'Tags', tag: tag, stores: stores });
};

exports.searchStores = async (req, res) => {
  const stores = await Store
  // first find stores that match
  .find({
    $text: {
      $search: req.query.q
    }
  }, {
    score: { $meta: 'textScore'} // we project/add a field('score') to the store;
                                 // the 'score' will be made up of meta-data; and textScore is the only meta-data in mongodb (for now)
  })
  // then sort them
  .sort({
    score: {$meta: 'textScore'}
  })
  // limit to only 5 results
  .limit(5);
  ;
  res.json(stores);
  //$text performs a text search on the content of the fields indexed with a text index
}

exports.mapStores = async (req, res) => {
  const coordinates = [Number(req.query.lng), Number(req.query.lat)]
  const q = {
    location: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: coordinates
        },
        $maxDistance: 10000 //10kilometers
      }
    }
  };

  const stores = await Store.find(q).select('slug name description location photo').limit(10); // pulling out of mongodb just the fields we need
  res.json(stores);
}

exports.mapPage = async (req, res) => {
  res.render('map', { title: 'Map'})
}

exports.heartStore = async (req, res) => {
  const hearts = req.user.hearts.map(heartObj => {
    return heartObj.toString();
  });
  // mongodb has overwritten the toString method on Object
  //const hearts = req.user.hearts.map(obj => obj.toString());
  const operator = hearts.includes(req.params.id) ? '$pull' : '$addToSet'; //$pull is mongodb operator of 'REMOVE'; $addToSet is operator of 'Add just once'
  const user = await User
    .findByIdAndUpdate(req.user._id,
      { [operator]: { hearts: req.params.id }}, // square brackets - computed property names in ES6
      { new: true }, // this returns to us the updated user, rather than the old user
  );
  res.json(user);
}

exports.getHearts = async (req, res) => {
  const stores = await Store.find({
    _id: { $in: req.user.hearts }
  })
  res.render('stores', { title: 'Hearted Stores', stores: stores})
}

exports.getTopStores = async (req, res) => {
  const stores = await Store.getTopStores();
  // res.json(stores);
  res.render('topStores', { stores: stores, title: '★ Top Stores'});
}
// if you are not going to wrap your await function in a try catch,
// you need to wrap the whole async function in an error handling function to catch errors ()

// exports.createStore = (req, res) => {
//   const store = new Store(req.body);
//   store
//     .save() // this fires off a connection to the mongodb database or gives an error
//     .then(stor => {
//       res.json(stor);
//     })
//     .cath(err => {
//       throw Error(err);
//     });
//     console.log('it worked!');
// };
