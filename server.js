const express = require("express");
const app = express();
const cors = require("cors");
const cookieParser = require("cookie-parser");

const router = require("./routers/index");

app.use(cors()).use(cookieParser());

const PORT = process.env.PORT || 1337;

app.use("/", router);

app.listen(PORT, () =>
  console.log(`server is connected http://localhost:${PORT}`)
);
