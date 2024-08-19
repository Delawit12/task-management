const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config/secrete");

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
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn }
  );
};
