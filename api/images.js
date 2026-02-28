
import mongoose from "mongoose";
import multer from "multer";
import cloudinary from "cloudinary";

let isConnected = false;

async function connectDB() {
  if (isConnected) return;
  await mongoose.connect(process.env.MONGO_URI);
  isConnected = true;
}

cloudinary.v2.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

const storage = multer.memoryStorage();
const upload = multer({ storage });

const imageSchema = new mongoose.Schema({
  title: String,
  imageUrl: String,
  createdAt: { type: Date, default: Date.now }
});

const Image = mongoose.models.Image || mongoose.model("Image", imageSchema);

export const config = {
  api: { bodyParser: false }
};

export default async function handler(req, res) {
  await connectDB();

  if (req.method === "GET") {
    const images = await Image.find().sort({ createdAt: -1 });
    return res.json(images);
  }

  if (req.method === "POST") {
    upload.single("image")(req, res, async function (err) {
      if (err) return res.status(500).json({ error: "Upload error" });

      const stream = cloudinary.v2.uploader.upload_stream(
        { resource_type: "image" },
        async (error, result) => {
          if (error) return res.status(500).json(error);

          const newImage = await Image.create({
            title: req.body.title,
            imageUrl: result.secure_url
          });

          res.json(newImage);
        }
      );

      stream.end(req.file.buffer);
    });
  }
}
