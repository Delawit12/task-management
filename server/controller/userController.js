const catchAsync = require("../errorHandler/catchAsync");
const AppError = require("../errorHandler/appError");
const User = require("../models/userModel");
const Email = require("../Utils/email");

exports.register = catchAsync(async (req, res, next) => {
  const { email, password, confirmPassword } = req.body;

  const user = await User.findOne({ email });
  if (user) {
    return next(
      new AppError("user already exist with this email account", 400)
    );
  }

  const newUser = await Photographer.create({
    email,
    password,
  });

  token = authUtils.signToken(newUser._id, newUser.role);

  res.status(201).json({
    data: {
      token,
      newUser,
      message: "Photographer registered successfully",
    },
  });
});
exports.login = catchAsync(async (req, res, next) => {
  // insert email and password
  // accept the inserted frm req.body
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError("Please provide email and password!", 400));
  }
  // get the user by using the email
  const user = await Photographer.findOne({ email }).select("+password");

  // no user: send error response
  if (!user) {
    return next(
      new AppError(
        "no account found with this email, please register first",
        400
      )
    );
  }
  // password compare
  if (!(await user.correctPassword(password, user.password))) {
    return next(new AppError("password not much", 400));
  }

  // create a token by using the user
  token = authUtils.signToken(user._id, user.role);
  console.log(user.role);
  // send response
  res.status(200).json({
    data: {
      token,
      user,
      message: "Log in successfully",
    },
  });
});
exports.forgetPassword = catchAsync(async (req, res, next) => {
  // enter ur email
  // accept the email from req.body
  const { email } = req.body;
  // check if the user exist with the email
  const user = await Photographer.findOne({ email });

  // no user: send error response
  if (!user) {
    return next(new AppError("no account found with this email", 400));
  }
  // generate 6 digit random number (OTP)
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  user.passwordResetOtp = otp;
  user.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

  console.log("otp", otp);

  await user.save({ validateBeforeSave: false });

  // send that random number to the email and hold the otp for conformation purpose
  try {
    await Email(user.email, otp);
    res.status(200).json({
      status: "success",
      message: "OTP sent to email!",
    });
  } catch (err) {
    console.error("Error sending OTP email:", err);
    user.passwordResetOtp = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return res.status(500).json({
      success: false,
      message: "There was an error sending the OTP. Try again later.",
    });
  }
});
exports.confirmOTP = catchAsync(async (req, res, next) => {
  // input the send otp with email
  const { email, otp } = req.body;
  // accept the input otp and compare it with the one that is stored in the db
  const user = await Photographer.findOne({ email });

  if (
    !user ||
    user.passwordResetOtp !== otp ||
    user.passwordResetExpires < Date.now()
  ) {
    return res.status(400).json({
      success: false,
      message: "Invalid or expired OTP. Please request a new OTP.",
    });
  }
  // remove from the data
  user.passwordResetOtp = undefined;
  user.passwordResetExpires = undefined;
  await user.save({ validateBeforeSave: false });
  // same :send successful response
  res.status(200).json({
    status: "success",
    message: "OTP verified successfully.",
  });
});
exports.passwordReset = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  const user = await Photographer.findOne({ email }).select("+password");

  if (await user.correctPassword(password, user.password)) {
    return next(new AppError("This is your previous password"));
  }

  user.password = password;
  await user.save();

  res.status(200).json({
    status: "success",
    message: "password reset successfully",
  });
});
exports.updatePassword = catchAsync(async (req, res, next) => {
  // accept the id from the req.id ,
  const id = req.id;
  //  accept the inputs form the req.body
  const { currentPassword, newPassword } = req.body;
  // get the photographer collection with the password then
  const user = await Photographer.findById(id).select("+password");
  //compare the password provided and the dbPassword
  if (!(await user.correctPassword(currentPassword, user.password))) {
    return next(new AppError("your current password is not correct", 401));
  }
  if (await user.correctPassword(newPassword, user.password)) {
    return next(
      new AppError(
        "please enter new  password , this is your previous password",
        401
      )
    );
  }
  //if the current password is correct then update the password and save
  user.password = newPassword;
  await user.save();
  // send response
  res.status(200).json({
    status: "success",
    message: "password updated successfully",
  });
});
exports.updateProfile = catchAsync(async (req, res, next) => {
  // accept the user id from req.id
  const id = req.id;

  // accept the updated fields from the req.body
  const { phoneNumber, address, bio, social_links } = req.body;
  // get the profilePicutre from req.file then store to the db
  let profilePicture;
  // console.log("req.files", req.files);
  // console.log("req.files", req.files.profilePicture);
  if (req.files && req.files.profilePicture) {
    // profilePicture = req.file.path;
    profilePicture = req.files.profilePicture[0].path;
  }
  console.log(req.files.profilePicture);
  // get the user by ID and  update then run validators  before save to the DB
  const user = await Photographer.findByIdAndUpdate(
    id,
    {
      profilePicture: profilePicture,
      phoneNumber: phoneNumber,
      address: address,
      bio: bio,
      social_links: social_links,
    },
    {
      new: true,
      runValidators: true,
    }
  );
  // then send response
  res.status(200).json({
    status: "success",
    message: "profile updated successfully",
    data: { user },
  });
});
exports.readMe = catchAsync(async (req, res, next) => {
  // get the id from req.id
  // get the user by id
  const user = await Photographer.findById(req.id);
  // send response with the user data
  res.status(200).json({
    status: "success",
    data: {
      user,
    },
  });
});
exports.deleteAccount = catchAsync(async (req, res, next) => {
  //  accept the current password

  const { currentPassword } = req.body;
  // compare with the one which is stored
  const user = await Photographer.findById(req.id).select("+password");
  if (!user) {
    return next(new AppError("no account found with this", 400));
  }
  if (!(await user.correctPassword(currentPassword, user.password))) {
    return next(new AppError("this is not Your current password", 401));
  }
  // find the user by it's id from req.id
  // user.deleteOne();
  await Photographer.findByIdAndDelete(req.id);
  //send no content status
  res.status(204).json({});
});
exports.getAllPhotographers = catchAsync(async (req, res, next) => {
  const photographers = await Photographer.find();
  res.status(200).json({
    status: "success",
    data: {
      photographers,
    },
  });
});
exports.readPhotographer = catchAsync(async (req, res, next) => {
  // get the id from req.params.id
  // get the user by id
  console.log(req.params.id);
  const photographer = await Photographer.findById(req.params.id);
  // user not found
  if (!photographer) {
    return next(new AppError("photographer not found", 400));
  }
  // send response with the user data
  res.status(200).json({
    status: "success",
    data: {
      photographer,
    },
  });
});

//admin controller

exports.updatePhotographer = catchAsync(async (req, res, next) => {
  const photographerId = req.params.id;
  // accept the status from req.body
  const { status } = req.body;
  if (!status) {
    return next(new AppError("all fields are required"));
  }
  // get the photographer by it's id  then update the status by req.body
  const photographer = await Photographer.findByIdAndUpdate(
    photographerId,
    {
      status: status,
    },
    {
      new: true,
      runValidators: true,
    }
  );
  // not found
  if (!photographer) {
    return next(new AppError("no photographer by this id", 404));
  }
  res.status(200).json({
    status: "success",
    data: {
      photographer,
    },
  });
});
