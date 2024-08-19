const mongoose = require("mongoose");
const { MONGODB_URI } = require("./secrete");
const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("connected to db");
  } catch (err) {
    console.log(err);
    console.log("is not connected to DB");
    process.exit(1);
  }
};
module.exports = connectDB;
