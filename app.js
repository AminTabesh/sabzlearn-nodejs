const express = require("express");
const authRouter = require("./routes/v1/auth");
const userRouter = require("./routes/v1/user");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");

const app = express();

//Packages
app.use(
  "courses/covers",
  express.static(path.join(__dirname, "public", "courses", "covers")),
);
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//Routes
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", userRouter);

module.exports = app;
