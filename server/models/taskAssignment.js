const mongoose = require("mongoose");

const taskAssignmentSchema = new mongoose.Schema({
  taskId: { type: Schema.Types.ObjectId, ref: "Task" },
  userId: { type: Schema.Types.ObjectId, ref: "User" }, //collaborator Id
  assignedAt: { type: Date, default: Date.now },
});

const TaskAssignment = mongoose.model("TaskAssignment", taskAssignmentSchema);

module.exports = TaskAssignment;
