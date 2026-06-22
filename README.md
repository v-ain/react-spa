# 🪐 Tech Dashboard Workspace v3.0

An autonomous, interactive engineering control panel and system monitoring simulator, built as a React SPA with a fully simulated client-side background layer.

🪐 **[Live Demo](https://v-ain.github.io/react-spa)** 

## 🖼 Interface Preview

*Dynamic memory metrics fluctuation, live event logger with auto-scroll, and a cybernetic authorization gateway featuring a brute-force bypass simulator.*

---

## ⚡ Key Features

* **Terminal Gateway (Landing)** — Cybernetic entry screen supporting the `[AUTO_BYPASS]` protocol (simulated hacker token brute-force bypass) and interactive regional cluster selection.
* **Live System Logs** — A comprehensive console at the bottom of the screen simulating real-time data processing. Generates new logs every few seconds with smart stick-to-bottom auto-scroll.
* **Dynamic Metrics Simulation** — Hardware module readouts (memory allocation, ping) fluctuate on the fly, creating a convincing illusion of a connected live server.
* **Strict Engineering Design** — An IDE-inspired interface (resembling LazyVim/VSCode) and technical documentation aesthetic with monospace accents (JetBrains Mono). Maximum info density with zero visual noise.

---

## 🛠 Tech Stack

* **Core:** React 19+ (SPA)
* **State Management:** React Hooks (`useState`, `useEffect`, `useRef`)
* **Styling:** Pure CSS3 (Custom Properties / CSS Variables)
* **Fonts:** JetBrains Mono & Inter via Google Fonts
* **Data Layer:** Local JSON Scheme

---

## 🚀 Local Setup (Quick Start)

To run the project locally on your machine, execute these three simple commands in your terminal:

1. **Clone the repository:**
   ```bash
   git clone https://github.com/v-ain/react-spa.git
   cd react-spa
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```
   *The application will be available locally at `http://localhost:3009/react-spa/`*

---

## 📦 Production & Deployment

The project is pre-configured for automated builds and seamless deployment to GitHub Pages.

* **Build for production:**
  ```bash
  npm run build
  ```
* **Deploy to GitHub Pages:**
  ```bash
  npm run deploy
  ```

---

## 🗂 Data Architecture (JSON Scheme)

The application operates completely autonomously on the client side. Data for each system module is encapsulated into a strict schema:

```json
{
  "id": "git-visualizer",
  "name": "GitVisualizer",
  "status": "online",
  "metrics": {
    "time": "14ms",
    "memory": "4.2MB"
  },
  "tabs": [
    {
      "name": "repository_map.json",
      "lines": [...]
    }
  ]
}
```

---

License: **MIT** | Developed with passion and a deep love for terminal-driven design.
