# 💖 Forever & Always | Interactive Romantic Keepsake Web Experience

An aesthetic, interactive, mobile-first web experience crafted to celebrate love, friendship, and special memories.

Anyone can easily fork or clone this repository, customize the names, memories, photos, and letters, and deploy it for free in minutes!

---

## ✨ Features

- 🌸 **Interactive Blooming Heart Tree**: Growing procedural tree animation on high-DPI HTML5 canvas with falling sakura petals.
- 📸 **Vintage Polaroid Photo Gallery**: Washi-taped photo cards with tap-to-zoom lightbox and smooth hover micro-interactions.
- 🎵 **Ambient Music Player**: Smooth background melody with live animated audio equalizer bars.
- 💌 **Wax-Sealed Unfolding Letter**: Click-to-open wax seal with realistic unfolding animation and heartfelt notes.
- 🏃‍♂️ **Playful Runaway "No" Button**: Physics-based evasive button that playfully dodges touches and clicks.
- ✏️ **Built-in Visual WYSIWYG Editor**: Add `?edit` to the URL on localhost to edit any text directly on the page and save changes instantly.
- 📱 **Mobile-First Responsive Design**: Optimized for iPhone, Android, tablets, and desktop screens with safe-area support.

---

## 🚀 Quick Start (Local Setup)

1. **Clone the repository:**
   ```bash
   git clone https://github.com/givemehat/for-medhavie.git
   cd for-medhavie
   ```

2. **Start the local server:**
   ```bash
   python3 server.py
   ```
   Or using any static HTTP server:
   ```bash
   npx serve .
   ```

3. **Open in browser:**
   ```
   http://localhost:8080
   ```

---

## 🎨 How to Customize for Your Special Someone

### Option 1: In-Browser Visual Editor (Easiest)
1. Run `python3 server.py` and open `http://localhost:8080?edit`.
2. Click on any text, title, quote, or badge to edit inline.
3. Click **"Save to Code"** at the top right to save changes directly to `index.html`.

### Option 2: Edit `index.html` Directly
- **Title & Header**: Change the text inside `<title>` and `<header>`.
- **Love Tree Card**: Update lines inside `#typewriter-content`.
- **Polaroid Photos**: Place your photos inside `assets/` and update the `src` tags in `#gallery-section`.
- **Wax Letter**: Update the letter content inside `#envelope-open`.
- **Background Music**: Replace `assets/music.mp3` with your favorite song.

---

## 🌐 Free 1-Click Deployment (GitHub Pages)

1. Fork or push this repository to your GitHub account.
2. Go to your repository's **Settings** → **Pages**.
3. Under **Build and deployment**:
   - **Source**: `Deploy from a branch`
   - **Branch**: `main` / `root`
4. Click **Save**. Your site will be live at `https://<your-username>.github.io/<repo-name>/` in ~60 seconds!

---

## 🛠️ Built With

- **HTML5 & CSS3** (Fluid Typography, CSS Animations)
- **Tailwind CSS** (Utility Styling)
- **Vanilla JavaScript** (Web Audio API, HTML5 Canvas Engine, Intersection Observer)
- **Canvas Confetti** (Celebration particle fireworks)

---

## 📄 License

MIT License — Feel free to use, customize, and share this with anyone you love! 💖
