const express = require("express");
const router = express.Router();
const ProjectController = require("../controller/ProjectController");
const auth = require("../middleware/authorization");

// create project
router.post("/create", auth.protect, ProjectController.createProject);

// // // update Project
// router.patch(
//   "/updateProject/:id",
//   auth.protect,
//   ProjectController.updateProject
// ); // can't add team member by this API

// //get all Projects
// router.get("/", auth.protect, ProjectController.allProjects);
// // get Project by it's id
// router.get("/:id", auth.protect, ProjectController.Project);

// // Delete Project
// router.delete("/:id", auth.protect, ProjectController.deleteProject); //should be owner of the project

// dashboard statics related to all Project
module.exports = router;
