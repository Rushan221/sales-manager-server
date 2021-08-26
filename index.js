const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const cors = require("cors");

dotenv.config();

const app = express();

//server setup
const PORT = process.env.PORT || 5000;
app.listen(5000, () => {
  console.log(`Server started in port ${PORT}`);
});

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: ["http://localhost:3000"],
    credentials: true,
  })
);

//mongo DB connection
mongoose.connect(
  process.env.MDB_CONNECT,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
  (err) => {
    if (err) return console.error(err);
    console.log("Connected to mongo DB");
  }
);

//routes
app.use("/auth", require("./routers/UserRouter"));
app.use("/item", require("./routers/ItemRouter"));
