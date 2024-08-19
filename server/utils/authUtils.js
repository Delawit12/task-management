const jwt = require("jsonwebtoken");
const { JWT_SECRET, JWT_EXPIRE_DATE } = require("../config/secrete");

// SignIn token generator.
/**
 *
 * @returns {String,String} - Token: for authentication and ExpiredIn: The time at which the token will be expired.
 */
exports.signToken = (id, role) => {
  return jwt.sign(
    {
      id: id,
      role: role,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRE_DATE }
  );
};
