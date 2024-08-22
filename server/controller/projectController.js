const catchAsync = require("../errorHandler/catchAsync");
const AppError = require("../errorHandler/appError");
const Project = require("../models/projectModel");

exports.createProject = catchAsync(async (req, res, next) => {
  // to create a project accept the data from req.body
  const { projectTitle, projectDescription, assignedUsers } = req.body;
  // the id of the user that create the project
  const ownerId = res.locals.id;
  //   check the title is new

  const project = await Project.create({
    projectTitle: projectTitle.toUpperCase(),
    projectDescription,
    ownerId,
  });
  project.assignedUsers.push(assignedUsers);
  // send response
  res.status(201).json({
    data: {
      project,
      message: "project created successfully",
    },
  });
});
