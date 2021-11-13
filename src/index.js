const express = require("express");
require("./db/mongoose");
// const Users = require("./models/users");
// const Tasks = require("./models/tasks");
const userRouter = require("./router/user");
const taskRouter = require("./router/task");

const app = express();
const port = process.env.PORT;

app.use(express.json());
app.use(userRouter);
app.use(taskRouter);

app.listen(port, () => {
  console.log("server started at Port " + port);
});
