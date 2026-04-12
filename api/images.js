import mongoose from "mongoose";
import multer from "multer";
import cloudinary from "cloudinary";

let isConnected = false;

async function connectDB() {
  if (isConnected) return;
  await mongoose.connect(process.env.MONGO_URI);
  isConnected = true;
}

// Cloudinary config
cloudinary.v2.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

// Multer config
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Schema
const imageSchema = new mongoose.Schema({
  title: String,
  imageUrl: String,
  publicId: String,
  fileType: String, // image / raw / video
  createdAt: { type: Date, default: Date.now }
});

const Image =
  mongoose.models.Image || mongoose.model("Image", imageSchema);

// Disable body parser
export const config = {
  api: { bodyParser: false }
};

// Handler
export default async function handler(req, res) {
  await connectDB();

  // GET
  if (req.method === "GET") {
    const images = await Image.find().sort({ createdAt: -1 });
    return res.json(images);
  }

  // POST (UPLOAD)
  if (req.method === "POST") {
    upload.single("image")(req, res, async function (err) {
      if (err) return res.status(500).json({ error: "Upload error" });

      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const stream = cloudinary.v2.uploader.upload_stream(
        { resource_type: "auto" }, // 🔥 supports images + pdf + docs
        async (error, result) => {
          if (error) return res.status(500).json(error);

          const newFile = await Image.create({
            title: req.body.title,
            imageUrl: result.secure_url,
            publicId: result.public_id,
            fileType: result.resource_type // 🔥 IMPORTANT
          });

          res.json(newFile);
        }
      );

      stream.end(req.file.buffer);
    });
  }

  // DELETE
  if (req.method === "DELETE") {
    const { id } = req.query;

    const file = await Image.findById(id);
    if (!file) {
      return res.status(404).json({ error: "File not found" });
    }

    await cloudinary.v2.uploader.destroy(file.publicId, {
      resource_type: "auto"
    });

    await Image.findByIdAndDelete(id);

    return res.json({ message: "Deleted successfully" });
  }
}