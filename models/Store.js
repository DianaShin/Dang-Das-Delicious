const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const slug = require('slugs');

const storeSchema = new mongoose.Schema({
  name: {
    type: String,
    true: true,
    required: 'Please enter a store name!'
  },
  slug: String,
  description: {
    type: String,
    trim: true
  },
  tags: [String],
  created: {
    type: Date,
    default: Date.now
  },
  location: {
    type: {
      type: String,
      default: 'Point'
    },
    coordinates: [{
      type: Number,
      required: 'You must supply coordinates'
    }],
    address: {
      type: String,
      required: 'You must supply address'
    }
  },
  photo: String,
  author: {
    type: mongoose.Schema.ObjectId, // that's the type for _id in MongoDB
    ref: 'User',
    required: 'You must supply an author'
  },
}, {
  toJSON: { virtuals: true }, //anytime a mongoDB document is converted to JSON or object, it will bring along the virutals for the ride
  toObject: { virtuals: true},
});

//Define our indexes
storeSchema.index({
  name: 'text', // we combine these two fields into a compound index as text - indexing as text will allow us to search efficiently
  description: 'text'
})

storeSchema.index({
  location: '2dsphere' //geospatial type
});

storeSchema.pre('save', async function(next) {
  if (!this.isModified('name')) {
    next(); //skip it
    return; // stop this function from running
  }
  this.slug = slug(this.name);
  // find other stores that have a slug of beerbar, beerbar-1, beerbar-2, etc
  // RegEx stuff: ^ means starts with.. $ means ends with..
  //              ? means optional.. i means case-insensitive
  const slugRegEx = new RegExp(`^(${this.slug})((-[0-9]*$)?)$`, 'i');
  const storesWithSlug = await this.constructor.find({ slug: slugRegEx });
  // we want to say Store.find(), but we don't have store yet, because we haven't made it... so, we use this.constructor, which will be equal to store when we do find
    if(storesWithSlug.length) {
      this.slug = `${this.slug}-${storesWithSlug.length + 1}`;
    }
  next();
});

storeSchema.statics.getTagsList = function() {
  return this.aggregate([
    { $unwind: '$tags'}, // aggregate takes an array of possible operators - we are grouping all of our items by the number of tags they have
    { $group: {_id: '$tags', count: { $sum: 1 } }}, // group the stores based on tag field, and then create a new field within each of those groups called count
    { $sort: { count: -1 }} // -1 means sort by desc, 1 means sort by asc
  ]);
}; // need to use a proper function, because need to use this inside the function, and this function is bound to the Store model

storeSchema.statics.getTopStores = function() {
  return this.aggregate([
    // Lookup Stores and populate their reviews
    { $lookup: { from: 'reviews', // MongoDB takes the 'Review' model and lowercases it and adds an 's' at the end
                'localField': '_id',
                'foreignField': 'store',
                 as: 'reviews' }},
    // filter for only items that have 2 or more reviews
    { $match: { 'reviews.1': { $exists: true } } }, //where the second item in reviews exists
    // add the average reviews field
    { $project: {
      averageRating: {
        $avg: '$reviews.rating', // create a new field($project) and call it 'averageRating' and set the value as the average of reviews.rating $ in front of revews.rating indicates that it is data being piped from $match
      },
      photo: '$$ROOT.photo', // need to add fields back in
      name: '$$ROOT.name',
      reviews: '$$ROOT.reviews',
      slug: '$$ROOT.slug',
    }},
    // sort it by our new field, highest reviews first
    { $sort: { averageRating: -1 }},
    // limit to at most 10
    { $limit: 10 }
  ])
}

// telling mongoDB to go to another model 'review' and do a quick query
// find reviews where the store's _id property === review's store property
storeSchema.virtual('reviews', {
  ref: 'Review',    // which model to link
  localField: '_id', // which field on the store?
  foreignField: 'store' // which field on the review?
});

function autopopulate(next) {
  this.populate('reviews');
  next();
}

storeSchema.pre('find', autopopulate);
storeSchema.pre('findOne', autopopulate);
module.exports = mongoose.model('Store', storeSchema);
