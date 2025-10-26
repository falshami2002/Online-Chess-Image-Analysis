import express from "express";
import multer from "multer";
import fs from "fs";
import cors from "cors";

const app = express();
const upload = multer({ dest: "uploads/" });
const PORT = process.env.PORT || 3000;

app.use(cors());

const PY_BACKEND_URL = process.env.PY_BACKEND_URL || "https://ml-model-microservice.onrender.com/predict"; 

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
            body: form,
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

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});