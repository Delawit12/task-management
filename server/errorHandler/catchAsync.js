// Global error handler method for the Asynchronous methods.
/**
 * @parma {function} fn -fn asynchronous function that expected to raise an error.
 * @returns {fn} fn -the result of execution of passed function .
 *
 *
 */

module.exports = catchAsync = (fn) => {
  return (req, res, next) => {
    // ! add a way to check error comes from catch
    fn(req, res, next).catch((err) => next(err));
  };
};
