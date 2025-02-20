// routes/authRoutes.js
const express = require("express");
const authController = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", authController.register);
router.post("/login", authController.login);
router.get("/me", authMiddleware.authenticate, authController.getMe);
router.get(
  "/protected",
  authMiddleware.authenticate,
  authController.protectedRoute
);
router.get(
  "/admin",
  authMiddleware.authenticate,
  authMiddleware.authorize(["admin"]),
  (req, res) => {
    res.json({ message: "Welcome Admin" });
  }
);

module.exports = router;
