const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const url = process.env.MONGO_LINK;
mongoose.connect(url, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const con = mongoose.connection;
con.on("error", () => console.log("DB connection Error"));
con.on("open", () => console.log("Connected to DB"));

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/login", require("./routes/login"));
app.use("/api/register", require("./routes/register"));
app.use("/api/user", require("./routes/user"));
app.use("/api/checkout", require("./routes/checkout"));
app.use("/api/product", require("./routes/product"));
app.use("/api/other", require("./routes/other"));

app.listen(process.env.PORT || "5000", () =>
  console.log("Server Started on Port: " + (process.env.PORT || "5000"))
);
