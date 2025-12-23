# CricScore 🏏

CricScore is a React Native mobile application for scoring cricket matches effortlessly. Built with **Expo**, it allows you to customize match rules and score games ball-by-ball.

## ✨ Features

- **Match Setup**:
  - Customize Team Names.
  - Set variable **Overs** per innings.
  - Set **Players** per team.
  - **Custom Rules**: Configure runs for Wides/No-balls and toggle Re-ball rules.
- **Advanced Scoring Features**:
  - **Player Stats**: Tracks Runs, Balls Faces, Fours, Sixes, Strike Rate for batters.
  - **Bowling Stats**: Tracks Overs, Maidens, Runs Conceded, Wickets, Economy.
  - **Bowler Rotation**: Manual bowler selection after every over.
  - **Strike Rotation**: Automatic strike rotation for odd runs and over completion.
- **Live Scoreboard**:
  - Intuitive interface for scoring runs (0-6).
  - Dedicated controls for **Wickets**, **Wides**, and **No-Balls**.
  - Displays current batter and bowler stats alongside the main score.
  - Visual tracking of the current over.
- **Detailed Match Results**:
  - Full winner summary.
  - **Scorecards**: Detailed batting and bowling tables for both innings.
  - **Extras**: Breakdown of Wides, No-balls, Byes, and Leg-byes.

## 🛠️ Tech Stack

- **Framework**: [Expo](https://expo.dev) (React Native)
- **Language**: TypeScript
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Styling**: [NativeWind](https://www.nativewind.dev) (Tailwind CSS)
- **Navigation**: React Navigation

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (LTS recommended)
- [Expo Go](https://expo.dev/client) app on your iOS/Android device (or a Simulator).

### Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd cric-score
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the app**:
   ```bash
   npx expo start
   ```

4. **Run on Device/Simulator**:
   - **iOS Simulator**: Press `i` in the terminal.
   - **Android Emulator**: Press `a` in the terminal.
   - **Physical Device**: Scan the QR code with the Expo Go app.

## 📂 Project Structure

- `src/screens`: UI screens (Match Setup, Scoreboard, Result).
- `src/components`: Reusable UI components (Scorecard, Modal).
- `src/store`: State management logic (Zustand).
- `src/utils`: Core game logic (Scoring, Stats).
- `src/types`: TypeScript definitions.
- `src/navigation`: App navigation configuration.
