const express = require("express");
const router = express.Router();

router.get("/test", (req, res) => {
  res.json({ mes: "posts works" });
});

module.exports = router;
