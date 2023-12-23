const Product = require("../models/productModel");

exports.createProduct = async (req, res, next) =>{
    const product = await Product.create(req.body);
    return res.status(201).json({
        success: true,
        product
    })
}


exports.getAllProducts = async (req, res) =>{
    const product = await Product.find();
    return res.status(200).json({message:"Running Successfully", product});
}