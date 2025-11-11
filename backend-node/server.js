import express from "express";
import multer from "multer";
import fs from "fs";
import cors from "cors";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";

const app = express();
app.use(express.json());
const upload = multer({ dest: "uploads/" });
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: ['http://localhost:5173', 'https://online-chess-image-analysis.netlify.app'],
  credentials: true
}));

app.use(cookieParser());

app.set("trust proxy", 1);

const PY_BACKEND_URL = process.env.PY_BACKEND_URL; 

const SECRET = process.env.JWT_SECRET;

const MONGO_URI = process.env.MONGO_URI;
mongoose.set("strictQuery", true);

try {
  await mongoose.connect(MONGO_URI, { dbName: "OnlineChessAnalysisUsers" });
  console.log("Connected to MongoDB");
} catch (err) {
  console.error("MongoDB connection error:", err);
  process.exit(1);
}

const gameSubScheme = new mongoose.Schema({
  fen: { type: String, required: true },
  title: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  games: { type: [gameSubScheme], default: []},
});

const User = mongoose.model("User", userSchema);

// register
app.post("/register", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const existing = await User.findOne({ email: email.toLowerCase().trim() }).lean();
    if (existing) return res.status(400).json({ error: "Email already exists" });

    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({ email, password: hash });

    return res.json({ message: "User registered", id: user._id });
  } catch (err) {
    if (err?.code === 11000) {
      return res.status(400).json({ error: "Email already exists" });
    }
    console.error("Register error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// login
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) return res.status(400).json({ error: "Email does not exist" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ error: "Wrong password" });

    const token = jwt.sign({ id: user._id.toString(), email: user.email }, SECRET, {
      expiresIn: "1h",
    });

    // Set HttpOnly cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: true, 
      sameSite: "none", 
      maxAge: 60 * 60 * 1000, // 1h
    });

    return res.json({ ok: true });

  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// get user games
app.get("/games", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id, { games: 1, _id: 0 }).lean();
    if (!user) return res.status(404).json({ error: "User not found" });
    return res.json(user.games ?? []);
  } catch (err) {
    console.error("Error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// create user game
app.post("/games", verifyToken, async (req, res) => {
  try {
    const { fen, title } = req.body;

    if (!fen || !title) {
      return res.status(400).json({ error: "fen and title are required" });
    }

    const game = { fen, title };

    const updated = await User.findByIdAndUpdate(
      req.user.id,
      { $push: { games: game } },
      {
        new: true,
        projection: { games: { $slice: -1 } } // return just the game we added
      }
    ).lean();

    if (!updated) return res.status(404).json({ error: "User not found" });

    return res.status(201).json(updated.games[0]);
  } catch (err) {
    console.error("Error saving game:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});


// middleware to verify JWT
function verifyToken(req, res, next) {
  const token = req.cookies?.token; 
  if (!token) return res.status(401).json({ error: "Missing token" });

  jwt.verify(token, SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ error: "Invalid token" });
    req.user = decoded;
    next();
  });
}

// prediction endpoint
app.post("/predict", upload.single("file"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded" });
        }

        const fileBuffer = await fs.promises.readFile(req.file.path);

        const form = new FormData();
        form.append("file", new Blob([fileBuffer]), req.file.originalname);

        const response = await fetch(PY_BACKEND_URL, {
            method: "POST",
            body: form
        });

        const data = await response.json().catch(() => null);
        await fs.promises.unlink(req.file.path);

        if (!data) {
            return res.status(500).json({ error: "Invalid response from prediction service" });
        }
        res.status(response.status).json(data);
    } catch (error) {
        console.error("Error processing request:", error);
        res.status(500).json({ error: "Internal server error" });
    }

});

// current user info
app.get("/me", verifyToken, async (req, res) => {
  const u = await User.findById(req.user.id).select("_id email").lean();
  if (!u) return res.status(404).json({ error: "User not found" });
  res.json({ id: u._id, email: u.email });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
