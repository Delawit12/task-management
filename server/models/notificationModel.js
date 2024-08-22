const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  userId: [{ type: Schema.Types.ObjectId, ref: "User" }], //single or array of user can get the same notification
  message: String,
  task: { type: Schema.Types.ObjectId, ref: "Task" },
  notificationType: {
    type: String,
    default: "alert",
    enum: ["alert", "message"],
  },
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

const Notification = mongoose.model("Notification", notificationSchema);

module.exports = Notification;
