const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("../middleware/catchAsyncError");
const User = require("../models/userModel");
const sendToken = require("../utils/jwtToken");
const sendEmail = require("../utils/sendEmail");
const crypto = require("crypto");

// Register a User
exports.registerUser = catchAsyncErrors(async (req, res, next) => {
  const { name, email, password } = req.body;

  const user = await User.create({
    name,
    email,
    password,
    avatar: {
      public_id: "this is sample id",
      url: "profileimg",
    },
  });

  sendToken(user, 200, res);
});

exports.loginUser = catchAsyncErrors(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(
      new ErrorHandler(400, "Please Enter a valid Email and Password")
    );
  }
  const user = await User.findOne({ email: email }).select("+password");
  if (!user) {
    return next(new ErrorHandler(401, "Invalid Email or Password"));
  }
  const isPasswordMatched = await user.comparePassword(password);
  if (!isPasswordMatched) {
    return next(new ErrorHandler(401, "Invalid Email or Password"));
  }
  sendToken(user, 200, res);
});

exports.logoutUser = catchAsyncErrors(async (req, res, next) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });
  res.status(200).json({
    success: true,
    message: "Logged Out",
  });
});

// Forget Password
exports.forgotPassword = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new ErrorHandler(404, "User Not Found"));
  }
  //  Get Reset Password Token
  const resetToken = user.getResetPasswordToken();
  await user.save({ validateBeforeSave: false });

  const resetPasswordUrl = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/password/reset/${resetToken}`;
  const message = `Your Password reset token is:- \n\n ${resetPasswordUrl} \n\n If you have not requested this email then please ignore it`;

  try {
    await sendEmail({
      email: user.email,
      subject: `Ecommerce Password Recovery`,
      message,
    });

    res.status(200).json({
      success: true,
      message: `Email sent to ${user.email} successfully`,
    });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new ErrorHandler(500, error.message));
  }
});

exports.resetPassword = catchAsyncErrors(async (req, res, next) => {
  // Creating token hash
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  // Find the user with the reset token and a valid expiration date
  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  // Check if the user exists and the token is still valid
  if (!user) {
    return next(
      new ErrorHandler(
        400,
        "Reset Password Token is Invalid or has been expired"
      )
    );
  }

  // Check if the new password and confirm password match
  if (req.body.password !== req.body.confirmPassword) {
    return next(new ErrorHandler(400, "Password doesn't match"));
  }

  // Update user password and clear reset token fields
  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  // Save the updated user to the database
  await user.save();

  // Send a new token for authentication
  sendToken(user, 200, res);
});

// Get Logined User Details
exports.getUserDetails = catchAsyncErrors(async (req, res, next) =>{
  const user = await User.findById(req.user.id);
  return res.status(200).json({
    success: true,
    user
  })
})

// Update / Change Password
exports.updatePassword = catchAsyncErrors(async (req, res, next)=>{
  const user = await User.findById(req.user.id).select("+password");
  const isPasswordMatched = await user.comparePassword(req.body.oldPassword);

  if(!isPasswordMatched){
    return next(new ErrorHandler(400, "Invalid email or password"));
  }

  if(req.body.newPassword !== req.body.confirmPassword){
    return next(new ErrorHandler(400, "Password does not Match"));
  }
  user.password = req.body.newPassword;
  await user.save();
  sendToken(user, 200, res );

});

// Change Profile Details
exports.updateProfile = catchAsyncErrors(async (req, res, next)=>{
  const newUserData = {
    name: req.body.name,
    email:req.body.email
  }
  const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
    new: true,
    runValidators: true,
    useFindAndModify: true 
  });

  return res.status(200).json({
    success: true,
    user
  })
})

// get All Users -- Admin
exports.getAllUsers = catchAsyncErrors(async (req, res, next)=>{
  const users = await User.find();
  return res.status(200).json({
    success: true,
    users
  })
})

// get Single User -- Admin
exports.getSingleUser = catchAsyncErrors(async (req, res, next)=>{
  const user = await User.findById(req.params.id);
  if(!user){
    return next(new ErrorHandler(400, `User Doesnot Exist with id : ${req.params.id}`))
  }
  return res.status(200).json({
    success: true,
    user
  })
})

// update User Roles -- Admin
exports.updateUser = catchAsyncErrors(async (req, res, next)=>{
  const newUserData = {
    name: req.body.name,
    email: req.body.email,
    role: req.body.role
  }
  const user = await User.findByIdAndUpdate(req.params.id, newUserData, {
    new: true,
    runValidators: true,
    useFindAndModify: true
  })
  return res.status(200).json({
    success: true,
  })
})

// Delete Users
exports.deleteUser = catchAsyncErrors(async (req, res, next)=>{
  const user = await User.findById(req.params.id);
  if(!user){
    return next(new ErrorHandler(400, `User doesnot exists with id ${req.params.id}`));
  }

  await user.deleteOne({ _id: req.params.id })
  return res.status(200).json({
    success: true
  })
})