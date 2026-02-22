require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static("public")); // VERY IMPORTANT

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

app.use("/api/images", require("./routes/imageRoutes"));

app.listen(process.env.PORT || 8080, () => {
  console.log("Server running on port 8080");
});