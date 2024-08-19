const express = require("express");
const router = express.Router();
const userController = require("../controller/userController");
const auth = require("../middleware/authorization");
router.post("/", userController.register);
router.post("/login", userController.login);
router.post("/logout", logoutUser);
router.post("/forgetPassword", userController.forgetPassword);
router.post("/confirmOTP", userController.confirmOTP);
router.post("/passwordReset", userController.passwordReset);

// login required
router.patch("/updatePassword", auth.protect, userController.updatePassword);
router.patch(
  "/updateProfile",
  auth.protect,
  upload,
  userController.updateProfile
);
router.get("/read-me", auth.protect, userController.readMe);
router.delete("/delete-me", auth.protect, userController.deleteAccount);
// admin route
router.patch("/:id", auth.protect, isAdmin, activateUserProfile);
module.exports = router;
