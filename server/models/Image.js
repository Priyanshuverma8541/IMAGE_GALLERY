const mongoose = require("mongoose");

const imageSchema = new mongoose.Schema({
  title: String,
  imageUrl: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Image", imageSchema);