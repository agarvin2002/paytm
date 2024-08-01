const express = require("express");
const zod = require("zod");
const User = require("../db");
const Account = require("../db");
const jwt = require("jsonwebtoken");
const userRouter = express.Router();
const { JWT_SECRET } = require("../config");
const router = require(".");
const authMiddleware = require("../middleware");

router.post("/singup", async (req, res) => {
  const body = req.body;

  const signupSchema = zod.object({
    username: zod.string().min(1),
    password: zod.string().min(1),
    firstname: zod.string().min(1),
    lastname: zod.string().min(1),
  });

  const { success, error } = signupSchema.safeParse(body);

  if (!success) {
    res.status(400).send(error);
  }

  const userExists = await User.findOne({ username: body.username });
  if (userExists) {
    return res.status(400).send({ error: "User already exists" });
  }

  const user = await User.create({
    username: body.username,
    password: body.password,
    firstname: body.firstname,
    lastname: body.lastname,
  });

  const userId = user._id;

  Account.create({
    userId: userId,
    balance: 1 + Math.random() * 10000,
  });
  const token = jwt.sign({ id: user._id });
  res.json({
    MESSAGE: " user created successfully",
    TOKEN: token,
  });
});
module.exports = userRouter;

router.post("/signin", async (req, res) => {
  const body = req.body;
  const signinSchema = zod.object({
    username: zod.string().min(1),
    password: zod.string().min(1),
  });

  const { success, error } = signinSchema.safeParse(body);
  if (!success) {
    res.status(400).send(error);
  }
  const user = await User.findOne({
    username: body.username,
    password: body.password,
  });
  if (!user) {
    return res.status(400).send({ error: "User does not exist" });
  }
  const token = jwt.sign({ id: user._id });
  res.status(200).json({
    token: token,
  });
});

router.put("/update", authMiddleware, async (req, res) => {
  const body = req.body;
  const updateSchema = zod.object({
    username: zod.string(),
    password: zod.string(),
    firstname: zod.string(),
    lastname: zod.string(),
  });
  const { success, error } = updateSchema.safeParse(body);
  if (!success) {
    res.status(400).send(error);
  }
  const user = await User.findOneAndUpdate({ _id: req.userId }, body, {
    new: true,
  });
  res.status(200).json({
    MESSAGE: "user updated successfully",
  });
});

router.get("/bulk", authMiddleware, async (req, res) => {
  const filter = req.query.filter || "";
  const users = await User.find({
    $or: [{ firstname: { $regex: filter } }, { lastname: { $regex: filter } }],
  });

  const userResult = users.map((user) => {
    return {
      _id: user._id,
      username: user.username,
      firstname: user.firstname,
      lastname: user.lastname,
    };
  });
  res.json({ users: userResult });
});
