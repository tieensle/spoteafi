const router = require("express").Router();
const {
  spotifyLogin,
  spotifyCallback,
  // refreshToken,
} = require("../controllers/spotifyController");

router.get("/", (req, res) => {
  res.send("server is running!");
});

router.get("/login", spotifyLogin);
router.get("/callback", spotifyCallback);
// router.get("/refresh-token", refreshToken);

module.exports = router;
