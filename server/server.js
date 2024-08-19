// const cors = require("cors");
const express = require("express");
const connectDB = require("./config/db.js");
const mongoose = require("mongoose");
// const mongoSanitize = require("express-mongo-sanitize");
const globalErrorHandler = require("./errorHandler/errorController.js");
const AppError = require("./errorHandler/appError.js");
const { PORT } = require("./config/secrete.js");

const app = express();

connectDB();
mongoose.set("strictQuery", true);

app.use(express.json());
app.use(express.json({ extended: false }));
// app.use(mongoSanitize());
app.use("/uploads", express.static("uploads"));

// general routes
const userRoute = require("./routes/userRoute.js");
const taskRoute = require("./routes/taskRoute.js");

app.use("/api/user", userRoute);
app.use("/task", taskRoute);

/*
General error handling for syncronus code.

! REMEMBER: it should be set in the beginning.

*/
process.on("uncaughtException", (err) => {
  console.log(err);
  console.log("Uncaught Exception");
  console.log("SHUTTING DOWN");
  process.exit(1);
});

const { swaggerUi, specs } = require("./swagger.js");
// DOCUMENTATIONS FOR THE WHOLE API.
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(specs));

// ! For showing the client 404 not found when searched for invalid  url.
app.all("/", (req, res, next) => {
  res
    .status(200)
    .json({ message: "please check the documentations", data: "api/docs/" });
});
app.all("*", (req, res, next) => {
  next(new AppError(`can't find ${req.originalUrl} on our server`, 404));
});

// Global error handler for handling errors globally.
app.use(globalErrorHandler);

app.listen(PORT, () => {
  console.log(`app is listening on port ${PORT}`);
});

// The error handler for all asynchronous codes.
process.on("unhandledRejection", (err) => {
  console.log(err.name, err.message),
    console.log("Unhandled error happened and shutting down ....");
  process.exit(1);
});
