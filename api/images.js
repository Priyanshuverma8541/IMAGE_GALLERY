import mongoose from "mongoose";
import multer from "multer";
import cloudinary from "cloudinary";

let isConnected = false;

// ✅ DB CONNECT (optimized)
async function connectDB() {
  if (isConnected) return;

  try {
    await mongoose.connect(process.env.MONGO_URI, {
      dbName: "galleryDB"
    });
    isConnected = true;
    console.log("MongoDB Connected");
  } catch (error) {
    console.error("DB Connection Error:", error);
  }
}

// ✅ Cloudinary config
cloudinary.v2.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

// ✅ Multer (memory upload)
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// ✅ Schema
const fileSchema = new mongoose.Schema({
  title: { type: String, required: true },
  imageUrl: String,
  publicId: String,
  fileType: String, // image / raw / video
  createdAt: { type: Date, default: Date.now }
});

const File =
  mongoose.models.File || mongoose.model("File", fileSchema);

// ✅ Disable bodyParser (important for multer)
export const config = {
  api: { bodyParser: false }
};

// ✅ MAIN HANDLER
export default async function handler(req, res) {
  await connectDB();

  // ============================
  // GET ALL FILES
  // ============================
  if (req.method === "GET") {
    try {
      const files = await File.find().sort({ createdAt: -1 });
      return res.status(200).json(files);
    } catch (err) {
      return res.status(500).json({ error: "Failed to fetch files" });
    }
  }

  // ============================
  // UPLOAD FILE
  // ============================
  if (req.method === "POST") {
    return upload.single("image")(req, res, async (err) => {
      if (err) {
        return res.status(500).json({ error: "Upload failed" });
      }

      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      try {
        const stream = cloudinary.v2.uploader.upload_stream(
          { resource_type: "auto" }, // 🔥 supports all types
          async (error, result) => {
            if (error) {
              return res.status(500).json({ error: "Cloudinary error" });
            }

            const newFile = await File.create({
              title: req.body.title,
              imageUrl: result.secure_url,
              publicId: result.public_id,
              fileType: result.resource_type // image / raw / video
            });

            return res.status(201).json(newFile);
          }
        );

        stream.end(req.file.buffer);
      } catch (error) {
        return res.status(500).json({ error: "Upload processing error" });
      }
    });
  }

  // ============================
  // DELETE FILE
  // ============================
  if (req.method === "DELETE") {
    try {
      const { id } = req.query;

      const file = await File.findById(id);
      if (!file) {
        return res.status(404).json({ error: "File not found" });
      }

      await cloudinary.v2.uploader.destroy(file.publicId, {
        resource_type: "auto"
      });

      await File.findByIdAndDelete(id);

      return res.json({ message: "Deleted successfully" });
    } catch (error) {
      return res.status(500).json({ error: "Delete failed" });
    }
  }

  // ============================
  // METHOD NOT ALLOWED
  // ============================
  return res.status(405).json({ error: "Method not allowed" });
}