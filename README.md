# CricScore 🏏

CricScore is a React Native mobile application for scoring cricket matches effortlessly. Built with **Expo**, it allows you to customize match rules and score games ball-by-ball.

## ✨ Features

- **Match Setup**:
  - Customize Team Names.
  - Set variable **Overs** per innings.
  - Set **Players** per team.
  - **Custom Rules**: Configure runs for Wides/No-balls and toggle Re-ball rules.
- **Live Scoreboard**:
  - Intuitive interface for scoring runs (0-6).
  - Dedicated controls for **Wickets**, **Wides**, and **No-Balls**.
  - Visual tracking of the current over.
- **Auto-Logic**:
  - Automatically handles tracking valid balls in an over.
  - Switches innings automatically when overs are done or the team is All Out.

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

- `src/screens`: UI screens (Match Setup, Scoreboard).
- `src/store`: State management logic (Zustand).
- `src/types`: TypeScript definitions.
- `src/navigation`: App navigation configuration.
