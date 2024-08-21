const catchAsync = require("../errorHandler/catchAsync");
const AppError = require("../errorHandler/appError");
const User = require("../models/userModel");
const Email = require("../utils/email");
const authUtils = require("../utils/authUtils");
const crypto = require("crypto");
exports.register = catchAsync(async (req, res, next) => {
  const { title, email, password, role } = req.body;
  console.log(role);

  const user = await User.findOne({ email });
  if (user) {
    return next(
      new AppError("user already exist with this email account", 400)
    );
  }

  const newUser = await User.create({
    title,
    email,
    password,
    role,
  });

  res.status(201).json({
    data: {
      newUser,
      message: "user created successfully",
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
  const user = await User.findOne({ email }).select("+password");

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
  console.log("user.role", user.role);
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
  const user = await User.findOne({ email });

  // no user: send error response
  if (!user) {
    return next(new AppError("no account found with this email", 400));
  }
  // generate url and send to email that contain the reset password token
  const resetToken = crypto.randomBytes(32).toString("hex");

  user.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  // Please note that you need to specify a time to expire this token. In this example is (10 min)
  user.passwordResetExpire = Date.now() + 10 * 60 * 1000;

  await user.save({ validateBeforeSave: false });

  console.log(resetToken);
  const resetURL = `${req.protocol}://${req.hostname}:7000/api/user/passwordReset/${resetToken}`;
  console.log(resetURL);
  // send that url  to the email
  try {
    await Email(user.email, resetURL);
    res.status(200).json({
      status: "success",
      message: "url sent to email!",
    });
  } catch (err) {
    console.error("Error sending resetURL email:", err);
    user.passwordResetToken = undefined;
    user.passwordResetExpire = undefined;
    await user.save({ validateBeforeSave: false });
    return res.status(500).json({
      success: false,
      message: "There was an error sending the url. Try again later.",
    });
  }
});

exports.passwordReset = catchAsync(async (req, res, next) => {
  // 1) Get user based on the token
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");
  console.log(req.params.token);
  const user = await User.findOne({
    passwordResetToken: hashedToken,
  });

  // 2) If token has not expired, and there is user , set the new password
  if (!user) {
    return next(
      new AppError("This token is invalid or expired, please try again!", 400)
    );
  }

  user.password = req.body.password;
  user.passwordResetToken = undefined;
  user.passwordResetExpire = undefined;

  await user.save();

  res.status(200).json({
    status: "success",
    message: "password reset successfully",
  });
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  // accept the id from the res.locals.id ,
  const id = res.locals.id;
  //  accept the inputs form the req.body
  const { currentPassword, newPassword } = req.body;
  // get the photographer collection with the password then
  const user = await User.findById(id).select("+password");
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
  const id = res.locals.id;

  // accept the updated fields from the req.body
  const { firstName, lastName, phoneNumber, address } = req.body;
  // get the profilePicutre from req.file then store to the db
  let profilePicture;
  console.log("req.files", req.files);
  // console.log("req.files", req.files.profilePicture);
  if (req.files && req.files.profilePicture) {
    // profilePicture = req.file.path;
    profilePicture = req.files.profilePicture[0].path;
  }
  // console.log(profilePicture);
  // get the user by ID and  update then run validators  before save to the DB
  const user = await User.findByIdAndUpdate(
    id,
    {
      firstName: firstName,
      lastName: lastName,
      profilePicture: profilePicture,
      phoneNumber: phoneNumber,
      address: address,
    },
    {
      new: true,
      runValidators: true,
    }
  );
  if (!user) {
    return next(
      new AppError("user not found may be  invalid id due to invalid token ")
    );
  }
  console.log(user);
  // then send response
  res.status(200).json({
    status: "success",
    message: "profile updated successfully",
    data: { user },
  });
});
exports.deleteAccount = catchAsync(async (req, res, next) => {
  //  accept the current password
  const { currentPassword } = req.body;
  // compare with the one which is stored
  const user = await User.findById(res.locals.id).select("+password");
  if (!user) {
    return next(new AppError("no account found with this Id", 400));
  }
  if (!(await user.correctPassword(currentPassword, user.password))) {
    return next(new AppError("this is not Your current password", 401));
  }
  // find the user by it's id from res.locals.id

  await User.findByIdAndDelete(res.locals.id);
  //send no content status
  res.status(204).json({});
});
exports.readUserByID = catchAsync(async (req, res, next) => {
  // get the id from req.id
  // get the user by id
  const user = await User.findById(req.params.id);
  // console.log(user);
  // send response with the user data
  res.status(200).json({
    status: "success",
    data: {
      user,
    },
  });
});

exports.readAllUser = catchAsync(async (req, res, next) => {
  const users = await User.find();
  res.status(200).json({
    status: "success",
    data: {
      users,
    },
  });
});

//admin controller

exports.activateUserProfile = catchAsync(async (req, res, next) => {
  const userId = req.params.id;
  // accept the status from req.body
  const { status, role } = req.body;

  // get the photographer by it's id  then update the status or the role by req.body
  const user = await User.findByIdAndUpdate(
    userId,
    {
      status: status,
      role: role,
    },
    {
      new: true,
      runValidators: true,
    }
  );
  // not found
  if (!user) {
    return next(new AppError("no user by this id", 404));
  }
  res.status(200).json({
    status: "success",
    data: {
      user,
    },
  });
});
