const express = require("express");
const authMiddleware = require("../../middlewares/auth");
const isAdminMiddleware = require("../../middlewares/isAdmin");

const userController = require("./../../controllers/v1/user");

const router = express.Router();

router.get("/", authMiddleware, isAdminMiddleware, userController.getAll);

router.post(
  "/ban/:id",
  authMiddleware,
  isAdminMiddleware,
  userController.banUser,
);

router.delete(
  "/:id",
  authMiddleware,
  isAdminMiddleware,
  userController.removeUser,
);

router.post(
  "/change-role/:id",
  authMiddleware,
  isAdminMiddleware,
  userController.changeRole,
);

router.put("/:id", authMiddleware, userController.updateInfo);

router.put(
  "/update-password/:id",
  authMiddleware,
  userController.updatePassword,
);

module.exports = router;
