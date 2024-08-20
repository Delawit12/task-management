const express = require("express");
const router = express.Router();
const userController = require("../controller/userController");
const auth = require("../middleware/authorization");

router.post("/register", auth.protect, auth.isAdmin, userController.register);
router.post("/login", userController.login);
router.post("/forgetPassword", userController.forgetPassword);
router.post("/passwordReset/:token", userController.passwordReset);

// // login required
router.patch("/updatePassword", auth.protect, userController.updatePassword);
router.patch("/updateProfile", auth.protect, userController.updateProfile);
router.get("/", auth.protect, userController.readAllUser);
router.get("/:id", auth.protect, userController.readUserByID);
router.delete("/", auth.protect, userController.deleteAccount);
// admin route
router.patch(
  "/:id",
  auth.protect,
  auth.isAdmin,
  userController.activateUserProfile
);
module.exports = router;
