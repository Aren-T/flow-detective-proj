# Flow Detective (v32.5)

**Flow Detective** is a "Local-First" web application designed to help users track, analyze, and optimize their psychological flow states. It combines the **Flow Channel Model** (Csikszentmihalyi) with the **Fogg Behavior Model** to provide deep insights into productivity and mental states.

> **Current Version**: v32.5 (Mobile Readability & Local Optimization)

---

## 🌟 Key Features

### 1. **Flow State Tracking**
- **Interactive Logging**: Record activities with dimensions like Challenge, Skill, Motivation, and Energy.
- **Auto-Computation**: The app automatically determines your state (Flow, Anxiety, Boredom, Apathy) based on the inputs.
- **Micro-Journaling**: Voice input and text notes for qualitative context.

### 2. **Analytics Dashboard**
- **Flow Channel Chart**: Visualizes your journey between anxiety and boredom.
- **Fogg Behavior Model**: Plot motivation vs. ability to see why actions happened (or didn't).
- **Time Distortion Lab**: Compare predicted vs. actual time to detect "deep work" states.
- **AI Summary**: Automated insights based on your log history.

### 3. **Local-First Architecture**
- **Privacy Focused**: All data is stored in your browser's `localStorage` by default.
- **No Login Required**: Immediate access with a simulated "Local Agent" user.
- **Data Portability**: Full CSV Import/Export functionality for backup and analysis.
- **Offline Capable**: Works without an internet connection (once loaded).

---

## 🛠 Tech Stack

- **Frontend**: React 19
- **Styling**: Tailwind CSS (v3.4) + Lucide React Icons
- **hosting**: GitHub Pages
- **Legacy/Cloud**: Firebase SDK (Auth/Firestore) is integrated but currently bypassed in "Local Mode" for speed and privacy.

---

## 📂 Project Architecture

The project uses a **Monolithic Component Structure** in `src/App.js` for rapid iteration, with a dedicated **Storage Adapter** pattern to handle data persistence.

### Key Components (`src/App.js`)
| Component | Description |
| :--- | :--- |
| `FlowDetective` | Main application container and state manager. |
| `storageAdapter` | **Critical**: Abstracted layer that switches between LocalStorage and Firebase. |
| `StatsDashboard` | Visualization hub containing all charts. |
| `LogList` | History view with edit/delete capabilities. |
| `ProfileModal` | User settings, data management (CSV), and cloud toggle. |

### Data Model (`Log Item`)
```json
{
  "id": "1707123456789",
  "activity": "Coding",
  "challenge": 7,
  "skill": 6,
  "flowState": { "id": "FLOW", "name": "Flow", "color": "text-green-500" },
  "timestamp": "2024-02-05T10:00:00.000Z"
}
```

---

## 🌿 Branch Strategy

We maintain two primary branches to serve different device form factors:

| Branch | Description | Application |
| :--- | :--- | :--- |
| **`main`** | **Phone Version (Default)**. Optimized for vertical scrolling, single-column layout, and one-handed use. | Deploy to Live Site |
| `ipad-layout` | **Tablet Version**. Responsive grid layout with multi-column dashboards and widened containers. | Experimental / Tablet |

> **Note**: The live deployment on GitHub Pages currently runs the **`main`** branch (Phone Version).

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/Aren-T/flow-detective-proj.git
   cd flow-detective-proj
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm start
   ```
   Open [http://localhost:3000](http://localhost:3000) in the browser.

### Building for Production
```bash
npm run build
```

### Deploying to GitHub Pages
```bash
npm run deploy
```

---

## 🤝 Contributing

1. **Local Mode**: Development is done in "Local Mode" (`isCloudMode = false`) by default.
2. **Typography**: We use standard mobile sizes (`text-base` for inputs, `text-sm` for body) to ensure readability.
3. **Icons**: Use `lucide-react` for all iconography.

---

## 📜 License

This project is open-source. Created for personal flow tracking and analysis.
