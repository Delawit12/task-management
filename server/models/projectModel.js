const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
  {
    projectTitle: { type: String, unique: true },
    projectDescription: String,
    assignedUsers: [
      {
        user: { type: mongoose.Types.ObjectId, ref: "User" },
        addedDate: { type: Date, default: Date.now() },
      },
    ],
    ownerId: { type: mongoose.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

const Project = mongoose.model("Project", projectSchema);

module.exports = Project;
