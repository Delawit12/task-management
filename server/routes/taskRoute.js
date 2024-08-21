const express = require("express");
const router = express.Router();
const taskController = require("../controller/taskController");
const auth = require("../middleware/authorization");

// create task
router.post("/create", auth.protect, taskController.createTask);
//duplicate task
router.post("/duplicate/:id", auth.protect, taskController.duplicateTask);

// create post task activity
router.post("/taskActivity/:id", auth.protect, taskController.postTaskActivity);

// //create sub task
router.post("/createSubTask/:id", auth.protect, taskController.createSubTask);

// // update task
router.patch("/updateTask/:id", auth.protect, taskController.updateTask); // can't add team member by this API

//get all tasks
router.get("/", auth.protect, taskController.allTasks);
// get task by it's id
router.get("/:id", auth.protect, taskController.task);

// add additional team members

// delete subTask
//moveTask to trash
// restoreDelete task

// dashboard statics related to all task , group tasks by priority , group tasks by stage and count
module.exports = router;
