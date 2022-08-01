import mongoose from 'mongoose';

/* Creating a schema for the product model. */
const ProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 100,
    },
    price: {
      type: Number,
      required: true,
      default: 0,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 1000,
    },
    image: {
      type: String,
      required: true,
      default: 'https://via.placeholder.com/150',
      minlength: 3,
      maxlength: 1000,
    },
    category: {
      type: String,
      required: true,
      enum: ['office', 'kitchen', 'bedroom'],
    },
    company: {
      type: String,
      required: true,
      enum: {
        values: ['ikea', 'liddy', 'marcos'],
        message: '{VALUE} is not supported',
      },
    },
    colors: {
      type: [String],
      required: true,
      enum: ['red', 'green', 'blue', 'yellow'],
    },
    featured: {
      type: Boolean,
      default: false,
    },
    freeShipping: {
      type: Boolean,
      default: false,
    },
    inventory: {
      type: Number,
      required: true,
      default: 10,
    },
    averageRating: {
      type: Number,
      default: 0,
    },
    numOfReviews: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

/* Creating a virtual field called reviews that will be populated with the reviews of the product. */
ProductSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'product',
  justOne: false,
});

/* A middleware that will be executed before the product is removed. It will delete all the reviews of
the product. */
ProductSchema.pre('remove', async function (next) {
  await this.model('Review').deleteMany({ product: this._id });
});

export default mongoose.model('Product', ProductSchema);
