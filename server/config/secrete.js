const dotenv = require("dotenv");
dotenv.config();

module.exports = {
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRE_DATE: process.env.JWT_SECRET,
  MONGODB_URI: process.env.MONGODB_URI,
  PORT: process.env.PORT,
  NODE_ENV: process.env.NODE_ENV,
};
