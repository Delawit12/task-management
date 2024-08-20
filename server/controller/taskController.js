const catchAsync = require("../errorHandler/catchAsync");
const AppError = require("../errorHandler/appError");
const Task = require("../models/taskModel");

exports.createTask = catchAsync(async (req, res, next) => {
  // to create task accept the data from req.body
  const { title, team, stage, date, priority, assets } = req.body;
  // the id of the user that create the task
  const userId = res.locals.id;
  // prepare a text that will be sent to the assigned peoples
  let text = "New task is assigned to you";
  if (team.length > 1) {
    text = text + ` and ${team.length - 1} others`;
  }

  text =
    text +
    ` ,The task priority set to ${priority} priority. So act according with the deadline also. `;
  // set the activity
  const activity = {
    type: "assigned",
    activity: text,
    by: userId,
  };
  // save to the data base(always save priority , stage and activity as a lowercase to make same as the enum value)
  const task = await Task.create({
    title,
    team,
    stage: stage.toLowerCase(),
    date,
    priority: priority.toLowerCase(),
    assets,
    activities: activity,
  });
  // send response
  res.status(201).json({
    data: {
      task,
      message: "Task created successfully",
    },
  });
});
exports.duplicateTask = catchAsync(async (req, res, next) => {
  const id = req.params.id;
  //   find the task with the id
  const task = await Task.findById(id);
  //   make the activity to send as a notice for the assigned user
  let text = "New task has been assigned to you";
  if (task.team.length > 1) {
    text = text + ` and ${task.team.length - 1} others.`;
  }

  text =
    text +
    ` The task priority is set a ${task.priority} priority, so check and act accordingly. Thank you!!!`;
  const activity = {
    type: "assigned",
    activity: text,
    by: res.locals.id,
  };
  //create new task with same information as the previous
  const newTask = await Task.create({
    title: task.title + " - Duplicate",
    team: task.team,
    stage: task.stage,
    date: task.date,
    priority: task.priority,
    assets: task.assets,
    activities: activity,
  });
  res.status(201).json({
    data: {
      newTask,
      message: "Task duplicated successfully",
    },
  });
});
exports.updateTask = catchAsync(async (req, res, next) => {});
exports.postTaskActivity = catchAsync(async (req, res, next) => {});
exports.createSubTask = catchAsync(async (req, res, next) => {});
exports.allTasks = catchAsync(async (req, res, next) => {
  const tasks = await Task.find().populate("team");
  if (!tasks) {
    return next(new AppError("no task is available "));
  }
  res.status(200).json({
    data: {
      message: "All tasks",
      length: tasks.length,
      data: {
        tasks,
      },
    },
  });
});
exports.task = catchAsync(async (req, res, next) => {
  const id = req.params.id;
  const task = await Task.findById(id);
  if (!task) {
    return next(new AppError("no task is available by this id"));
  }
  res.status(200).json({
    data: {
      message: "specified tasks",
      length: task.length,
      data: {
        task,
      },
    },
  });
});

// exports.createTask = catchAsync(async (req, res, next) => {});
