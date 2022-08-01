import mongoose from 'mongoose';

/* This is creating a schema for the review model. */
const ReviewSchema = new mongoose.Schema(
  {
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 50,
    },
    comment: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 2000,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
  },
  { timestamps: true }
);

/* This is creating a unique index on the user and product fields. 
In that way, an user only can review one product */
ReviewSchema.index({ user: 1, product: 1 }, { unique: true });

/* This is a static method that is used to calculate the average rating of a product. */
ReviewSchema.statics.getAverageRating = async function (productId) {
  const average = await this.aggregate([
    {
      $match: { product: productId },
    },
    {
      $group: {
        _id: null,
        averageRating: { $avg: '$rating' },
        numOfReviews: { $sum: 1 },
      },
    },
  ]);
  try {
    await this.model('Product').findByIdAndUpdate(productId, {
      averageRating: average[0] ? average[0].averageRating : 0,
      numOfReviews: average[0] ? average[0].numOfReviews : 0,
    });
  } catch (error) {
    console.log(error);
  }
};

/* This is a middleware that is executed after the save method. */
ReviewSchema.post('save', function (doc, next) {
  this.constructor.getAverageRating(doc.product);
  next();
});

/* This is a middleware that is executed after the remove method. */
ReviewSchema.post('remove', function (doc, next) {
  this.constructor.getAverageRating(doc.product);
  next();
});

export default mongoose.model('Review', ReviewSchema);
