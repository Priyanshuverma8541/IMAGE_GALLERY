// api/images.js

require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;

const app = express();

app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

// Multer
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Schema
const imageSchema = new mongoose.Schema({
  title: String,
  imageUrl: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Image = mongoose.models.Image || mongoose.model("Image", imageSchema);

// Upload Route
app.post("/api/images/upload", upload.single("image"), async (req, res) => {
  try {
    const stream = cloudinary.uploader.upload_stream(
      { resource_type: "image" },
      async (error, result) => {
        if (error) return res.status(500).json(error);

        const newImage = new Image({
          title: req.body.title,
          imageUrl: result.secure_url
        });

        await newImage.save();
        res.json(newImage);
      }
    );

    stream.end(req.file.buffer);

  } catch (err) {
    res.status(500).json(err);
  }
});

// Get All Images
app.get("/api/images", async (req, res) => {
  const images = await Image.find();
  res.json(images);
});

module.exports = app;