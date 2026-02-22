const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const cloudinary = require("../config/cloudinary");
const Image = require("../models/Image");

// Upload Image
router.post("/upload", upload.single("image"), async (req, res) => {
  try {
    const result = await cloudinary.uploader.upload_stream(
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
    ).end(req.file.buffer);
  } catch (err) {
    res.status(500).json(err);
  }
});

// Get All Images
router.get("/", async (req, res) => {
  const images = await Image.find();
  res.json(images);
});

module.exports = router;