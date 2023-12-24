const Product = require("../models/productModel");
const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("../middleware/catchAsyncError");
// Create Product -- Admin
exports.createProduct = catchAsyncErrors(async (req, res, next) => {
    const product = await Product.create(req.body);
    return res.status(201).json({
        success: true,
        product
    })
})

// Get All Products --User
exports.getAllProducts = catchAsyncErrors(async (req, res) => {
    const product = await Product.find();
    return res.status(200).json({ success: true, product });
})
// Update Product --Admin
exports.updateProduct = catchAsyncErrors(async (req, res, next) => {
    let product = await Product.findById(req.params.id);
    if (!product) {
        return next(new ErrorHandler(404, "Products Data not Found"))
    }
    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
        useFindAndModify: false
    });
    return res.status(200).json({
        success: true,
        product
    })
})

// Delete Product --Admin
exports.deleteProduct = catchAsyncErrors(async (req, res) => {
    const product = await Product.findById(req.params.id);
    if (!product) {
        return next(new ErrorHandler(404, "Products Data not Found"))
    }

    await product.deleteOne({ _id: req.params.id });
    return res.status(200).json({
        success: true,
        message: "Product Deleted Successfully"
    })
})

//  Get Product -- Admin

exports.getProduct = catchAsyncErrors(async (req, res) => {
    const product = await Product.findById(req.params.id);
    if (!product) {
        return next(new ErrorHandler(404, "Products Data not Found"))
    }
    return res.status(200).json({
        success: true,
        product
    })
})