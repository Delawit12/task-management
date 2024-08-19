const AppError = require("./appError.js");

const handleCastErrorDB = (err) => {
  const message = ` Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
  // console.log(err);
  // const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  let value = "";
  const message = `Duplicate field value: ${value}. Please use another value!`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);

  const message = `Invalid input data. ${errors.join(". ")}`;
  return new AppError(message, 400);
};

const handleJWTError = () =>
  new AppError("Invalid token. Please log in again!", 401);

const handleJWTExpiredError = () =>
  new AppError("Your token has expired! Please log in again.", 401);

// sending error message in development mode.
const sendErrorDev = (err, req, res) => {
  if (req.originalUrl.startsWith("/api")) {
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  }
};

// sending error message in production mode .
const sendErrorProd = (err, req, res) => {
  // Check if it's a JSON parsing error
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({
      status: "error",
      message: "Invalid JSON format in request body",
    });
  }
  if (err.isOperational) {
    return res
      .status(err.statusCode)
      .json({ status: err.status, message: err.message });
  }
  // sending generic message for the client with out exposing detail
  return res.status(500).json({
    status: "error",
    message: "Something went wrong!",
    error: err,
    message: err.message,
  });
};

module.exports = (err, req, res, next) => {
  // console.error(err);
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "Error";

  let error = {
    ...err,
  };
  error.message = err.message;

  if (err.name === "CastError") error = handleCastErrorDB(err);

  if (err.code === 11000) error = handleDuplicateFieldsDB();

  if (err.name === "ValidationError") error = handleValidationErrorDB(err);

  if (err.name === "JsonWebTokenError") error = handleJWTError();

  if (err.name === "TokenExpiredError") error = handleJWTExpiredError();

  sendErrorProd(error, req, res);
};
