const uploadForm = document.getElementById("uploadForm");
const playlistContainer = document.getElementById("songList");
const audio = new Audio();

const coverImg = document.getElementById("cover");
const songTitle = document.getElementById("song-title");

const btnPrev = document.getElementById("prev");
const btnNext = document.getElementById("next");
const btnToggle = document.getElementById("togglePlay");
const btnMute = document.getElementById("mute");

const progressBar = document.getElementById("progress");
const currentTimeEl = document.getElementById("current-time");
const remainingTimeEl = document.getElementById("remaining-time");

let playlist = [];
let currentIndex = 0;

// ====== UTILIDADES ======
function formatTime(t) {
  if (isNaN(t)) return "0:00";
  const m = Math.floor(t / 60);
  const s = Math.floor(t % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

// ====== CARGAR CANCIONES ======
async function loadSongsFromServer() {
  const res = await fetch("/songs");
  const songs = await res.json();
  playlist = songs;
  updatePlaylistUI();
}

loadSongsFromServer();

// ====== REPRODUCTOR ======
function loadSong(index) {
  currentIndex = index;
  const song = playlist[currentIndex];

  audio.src = song.audioPath;

  songTitle.textContent = song.title;
  coverImg.src = song.coverPath || "";

  audio.play();
  updatePlayButton();
}

function updatePlayButton() {
  btnToggle.textContent = audio.paused ? "▶" : "⏸";
}

function updateProgress() {
  currentTimeEl.textContent = formatTime(audio.currentTime);
  remainingTimeEl.textContent =
    "-" + formatTime(audio.duration - audio.currentTime);

  progressBar.value = (audio.currentTime / audio.duration) * 100 || 0;
}

// ====== UI LISTA ======
function updatePlaylistUI() {
  playlistContainer.innerHTML = "";

  playlist.forEach((song, i) => {
    const div = document.createElement("div");
    div.classList.add("song-item");

    div.innerHTML = `
      ${song.coverPath ? `<img src="${song.coverPath}">` : ""}
      <span>${song.title}</span>
      <button>Play</button>
    `;

    div.querySelector("button").addEventListener("click", () => loadSong(i));
    playlistContainer.appendChild(div);
  });
}

// ====== EVENTOS ======
btnToggle.addEventListener("click", () => {
  if (audio.paused) audio.play();
  else audio.pause();
  updatePlayButton();
});

btnPrev.addEventListener("click", () => {
  currentIndex = (currentIndex - 1 + playlist.length) % playlist.length;
  loadSong(currentIndex);
});

btnNext.addEventListener("click", () => {
  currentIndex = (currentIndex + 1) % playlist.length;
  loadSong(currentIndex);
});

btnMute.addEventListener("click", () => {
  audio.muted = !audio.muted;
  btnMute.style.opacity = audio.muted ? 0.5 : 1;
});

audio.addEventListener("timeupdate", updateProgress);

progressBar.addEventListener("input", () => {
  audio.currentTime = (progressBar.value / 100) * audio.duration;
});

audio.addEventListener("ended", () => {
  currentIndex = (currentIndex + 1) % playlist.length;
  loadSong(currentIndex);
});

// ====== SUBIDA DE CANCIONES ======
uploadForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  // ⭐⭐ FIX IMPORTANTE ⭐⭐
  const formData = new FormData();
  formData.append("title", uploadForm.title.value);
  formData.append("audio", uploadForm.audio.files[0]);
  formData.append("cover", uploadForm.cover.files[0]);

  const res = await fetch("/upload", {
    method: "POST",
    body: formData
  });

  if (res.ok) {
    const song = await res.json();

    playlist.push(song);
    updatePlaylistUI();
    alert("Canción subida!");
  } else {
    alert("Error al subir canción");
  }
});