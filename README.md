# Chess Game

A simple real-time chess game built with Node.js, Express, EJS, Socket.IO, and chess.js.

## What this project is

This project is a browser-based multiplayer chess game. Two players can connect to the server and play against each other in real time. The server keeps track of the board state and validates moves.

## Features

- Real-time multiplayer chess gameplay
- Turn-based play with turn tracking
- Pawn promotion with piece selection
- Winner and draw detection at the end of the game
- Simple web interface

## Project structure

- app.js - Main server file
- public/ - Frontend assets such as CSS and JavaScript
- views/ - EJS templates for the browser page
- package.json - Project dependencies

## Requirements

Make sure you have Node.js installed on your computer.

## Install dependencies

Open the project folder in your terminal and run:

```bash
npm install
```

## Start the server

Run:

```bash
node app.js
or
npm run start
```

Then open your browser and go to:

```text
http://localhost:3000
```

## How to play

1. Open the game in your browser.
2. The first player connected becomes White and the second becomes Black.
3. Players take turns moving pieces.
4. Drag a piece to a valid square to make a move.
5. If a pawn reaches the last rank, choose the piece to promote to.
6. The game ends when a player is checkmated or the game is drawn.

## Notes

- This is a beginner-friendly chess project.
- The app is designed for learning and demonstration.
- For the best experience, open the game in two browser tabs or devices.
