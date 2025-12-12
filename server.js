const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3000;

// === Carpeta pública ===
app.use(express.static("docs"));
app.use("/uploads", express.static("uploads"));

app.use(express.json());

// === Configurar subida de archivos ===
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const name = Date.now() + "-" + file.originalname;
    cb(null, name);
  }
});

const upload = multer({ storage });

// === Ruta para subir canciones ===
app.post("/upload", upload.fields([
  { name: "audio", maxCount: 1 },
  { name: "cover", maxCount: 1 }
]), (req, res) => {

  const audioFile = req.files.audio ? req.files.audio[0] : null;
  const coverFile = req.files.cover ? req.files.cover[0] : null;

  if (!audioFile) {
    return res.status(400).json({ error: "No enviaste audio" });
  }

  const newSong = {
    title: req.body.title || "Sin título",
    audioPath: "/uploads/" + audioFile.filename,
    coverPath: coverFile ? "/uploads/" + coverFile.filename : ""
  };

  const filePath = path.join(__dirname, "songs.json");

  let songs = [];
  if (fs.existsSync(filePath)) {
    songs = JSON.parse(fs.readFileSync(filePath, "utf8"));
  }

  songs.push(newSong);

  fs.writeFileSync(filePath, JSON.stringify(songs, null, 2));

  res.json(newSong);
});

// === Obtener canciones ===
app.get("/songs", (req, res) => {
  const filePath = path.join(__dirname, "songs.json");

  if (!fs.existsSync(filePath)) {
    return res.json([]);
  }

  const songs = JSON.parse(fs.readFileSync(filePath, "utf8"));
  res.json(songs);
});

// === Iniciar servidor ===
app.listen(PORT, () =>
  console.log("Server ON: http://localhost:" + PORT)
);