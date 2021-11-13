const { Router } = require("express");
const Tasks = require("../models/tasks");
const auth = require("../middleware/auth");
const router = new Router();

router.post("/task", auth, async (req, res) => {
  const task = new Tasks({
    ...req.body,
    owner: req.user._id,
  });
  try {
    await task.save();
    res.send(task);
  } catch (e) {
    res.status(400).send(e);
  }
});
router.get("/task", auth, async (req, res) => {
  const match = {};
  const sort = {};
  if (req.query.completed) {
    match.completed = req.query.completed === "true";
  }
  if (req.query.sortBy) {
    const part = req.query.sortBy.split(":");
    sort[part[0]] = part[1] === "desc" ? -1 : 1;
  }

  try {
    await req.user
      .populate({
        path: "task",
        match,
        options: {
          limit: parseInt(req.query.limit),
          skip: parseInt(req.query.skip),
          sort,
        },
      })
      .execPopulate();
    res.send(req.user.task);
    // Another way of the doing the same thing
    // const tasks = await Tasks.find(match);
    // res.send(tasks);
  } catch (e) {
    res.status(400).send(e);
  }
});
router.get("/task/:id", auth, async (req, res) => {
  try {
    const task = await Tasks.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });
    if (!task) {
      res.status(404).send("id not found");
    }
    res.send(task);
  } catch (e) {
    res.status(400).send(e);
  }
});
router.patch("/task/:id", auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdate = ["description", "completed"];
  const isValid = updates.every((update) => allowedUpdate.includes(update));
  if (!isValid) {
    return res.status(400).send("invalid update");
  }
  try {
    const task = await Tasks.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });
    // const task = await Tasks.findById(req.params.id);
    if (!task) {
      res.status(404).send("id not found");
    }
    updates.forEach((update) => (task[update] = req.body[update]));
    task.save();
    res.send(task);
  } catch (e) {
    res.status(500).send(e);
  }
});
router.delete("/task/:id", auth, async (req, res) => {
  try {
    const task = await Tasks.findOne({
      _id: req.params.id,
      owner: req.user._id,
    }); //can use findOneAndDelete()
    if (!task) {
      res.status(404).send();
    }
    task.remove(); //no need to use this is find one and delete
    res.send(task);
  } catch (e) {
    res.status(500).send();
  }
});

module.exports = router;
