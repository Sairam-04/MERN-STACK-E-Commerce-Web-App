const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("../middleware/catchAsyncError");
const User = require("../models/userModel");
const sendToken = require("../utils/jwtToken");
const sendEmail = require("../utils/sendEmail");

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
  const isPasswordMatched = user.comparePassword(password);
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
exports.forgotPassword = catchAsyncErrors(async (req, res, next)=>{
  const user = await User.findOne({email: req.body.email});
  if(!user){
    return next(new ErrorHandler(404, "User Not Found"));
  }
  //  Get Reset Password Token
  const resetToken = user.getResetPasswordToken();
  await user.save({validateBeforeSave: false});

  const resetPasswordUrl = `${req.protocol}://${req.get("host")}/api/v1/password/reset/${resetToken}`;
  const message = `Your Password reset token is:- \n\n ${resetPasswordUrl} \n\n If you have not requested this email then please ignore it`;

  try{

    await sendEmail({
      email: user.email,
      subject: `Ecommerce Password Recovery`,
      message,
    });

    res.status(200).json({
      success: true,
      message: `Email sent to ${user.email} successfully`
    })

  }catch(error){
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({validateBeforeSave: false});
    return next(new ErrorHandler(500,error.message))
  }
})