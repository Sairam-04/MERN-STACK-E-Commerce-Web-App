const Product = require("../models/productModel");
const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("../middleware/catchAsyncError");
const ApiFeatures = require("../utils/apiFeatures");
// Create Product -- Admin
exports.createProduct = catchAsyncErrors(async (req, res, next) => {
  req.body.user = req.user.id;
  const product = await Product.create(req.body);
  const productCount = await Product.countDocuments();
  return res.status(201).json({
    success: true,
    product,
    productCount,
  });
});

// Get All Products --User
exports.getAllProducts = catchAsyncErrors(async (req, res) => {
  // Pagination
  const resultPerPage = 5;
  const productCount = await Product.countDocuments();
  const apiFeature = new ApiFeatures(Product.find(), req.query)
    .search()
    .filter()
    .pagination(resultPerPage);
  const product = await apiFeature.query;
  return res.status(200).json({ success: true, product, productCount });
});
// Update Product --Admin
exports.updateProduct = catchAsyncErrors(async (req, res, next) => {
  let product = await Product.findById(req.params.id);
  if (!product) {
    return next(new ErrorHandler(404, "Products Data not Found"));
  }
  product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });
  return res.status(200).json({
    success: true,
    product,
  });
});

// Delete Product --Admin
exports.deleteProduct = catchAsyncErrors(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    return next(new ErrorHandler(404, "Products Data not Found"));
  }

  await product.deleteOne({ _id: req.params.id });
  return res.status(200).json({
    success: true,
    message: "Product Deleted Successfully",
  });
});

//  Get Product -- Admin

exports.getProduct = catchAsyncErrors(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    return next(new ErrorHandler(404, "Products Data not Found"));
  }
  return res.status(200).json({
    success: true,
    product,
  });
});

// Create Review or Update the Review

exports.createProductReview = catchAsyncErrors(async (req, res, next) => {
  const { rating, comment, productId } = req.body;
  const review = {
    user: req.user._id,
    name: req.user.name,
    rating: Number(rating),
    comment: comment,
  };
  const product = await Product.findById(productId);
  const isReviewed = product.reviews.find(
    (rev) => rev.user.toString() === req.user._id.toString()
  );
  if (isReviewed) {
    product.reviews.forEach((rev) => {
      // If Reviewed Already then finding that review and updating it
      if (rev.user.toString() === req.user._id.toString()) {
        (rev.rating = rating), (rev.comment = comment);
      }
    });
  } else {
    product.reviews.push(review);
    product.numOfReviews = product.reviews.length;
  }
  let avg = 0;
  product.reviews.forEach((rev) => {
    avg += rev.rating;
  });
  product.ratings = avg / product.reviews.length;

  await product.save({ validateBeforeSave: false });
  return res.status(200).json({
    success: true,
  });
});


// get All Review of a Single Product
exports.getProductReviews = catchAsyncErrors(async (req, res, next)=>{
  const product = await Product.findById(req.query.id);
  if(!product){
    return next(new ErrorHandler(400, "Product not found"));
  }

  return res.status(200).json({
    success: true,
    reviews: product.reviews
  })
})

// Delete a Review of a Single Product
exports.deleteReview = catchAsyncErrors(async (req, res, next) => {
  const product = await Product.findById(req.query.productId);
  if (!product) {
    return next(new ErrorHandler(400, "Product not found"));
  }

  const reviews = product.reviews.filter((rev) => rev._id.toString() !== req.query.id.toString());

  let avg = 0;
  reviews.forEach((rev) => {
    avg += rev.rating;
  });
  const ratings = avg / reviews.length;
  const numOfReviews = reviews.length;

  await Product.findByIdAndUpdate(
    req.query.productId,
    {
      reviews,
      ratings,
      numOfReviews,
    },
    {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    }
  );

  return res.status(200).json({
    success: true,
  });
});
