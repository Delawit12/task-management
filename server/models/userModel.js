const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const crypto = require("crypto");

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String },
    lastName: { type: String },
    title: { type: String, required: true },
    role: {
      type: String,
      required: true,
      enum: [
        "admin",
        "manager",
        "dataAnalyst",
        "developer",
        "accountant",
        "supervisor",
        "teamLeader",
      ],
      default: "developer",
    },
    email: { type: String, required: true, unique: true },
    profilePicture: { type: String },
    phoneNumber: { type: String },
    address: { type: String },
    password: { type: String, required: true },
    tasks: [{ type: mongoose.Types.ObjectId, ref: "Task" }],
    status: { type: String, enum: ["active", "inactive"], default: "active" },
    passwordResetExpire: { type: String },
    passwordResetToken: { type: String },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.correctPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);

module.exports = User;
