const express = require("express");
const socket = require("socket.io");
const http = require("http");
const path = require("path");
const { Chess } = require("chess.js");
const { log } = require("console");

const app = express();

const server = http.createServer(app);
const io = socket(server);

const chess = new Chess();
let players = {};
let currentPlayer = "w";

const getGameResult = () => {
  if (chess.isCheckmate()) {
    const winner = chess.turn() === "w" ? "Black" : "White";
    return { over: true, winner, reason: "checkmate" };
  }

  if (chess.isStalemate()) {
    return { over: true, winner: "Draw", reason: "stalemate" };
  }

  if (chess.isInsufficientMaterial()) {
    return { over: true, winner: "Draw", reason: "insufficient material" };
  }

  if (chess.isThreefoldRepetition()) {
    return { over: true, winner: "Draw", reason: "threefold repetition" };
  }

  if (chess.isFivefoldRepetition()) {
    return { over: true, winner: "Draw", reason: "fivefold repetition" };
  }

  if (chess.isHalfmoveDraw()) {
    return { over: true, winner: "Draw", reason: "50-move rule" };
  }

  return { over: false, winner: null, reason: null };
};

const broadcastGameState = () => {
  const turn = chess.turn();
  currentPlayer = turn;
  io.emit("turn", turn);

  const result = getGameResult();
  if (result.over) {
    io.emit("gameOver", result);
  }
};

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.render("index", {title: "Chess Game"});
})

io.on("connection", (uniquesocket) => {
  console.log("connected");

  if(!players.white) {
    players.white = uniquesocket.id;
    uniquesocket.emit("playerRole", "w");
  }
  else if(!players.black) {
    players.black = uniquesocket.id;
    uniquesocket.emit("playerRole", "b");
  } 
  else {
    uniquesocket.emit("spectatorRole");
  }

  uniquesocket.emit("turn", chess.turn());
  
  uniquesocket.on("disconnect", () => {
    if(uniquesocket.id === players.white) {
      delete players.white;
    } else if(uniquesocket.id === players.black) {
      delete players.black;
    }
  });

  uniquesocket.on("move", (move) => {
    try {
      if(chess.turn() === 'w' && uniquesocket.id !== players.white) return;
      if(chess.turn() === 'b' && uniquesocket.id !== players.black) return;

      const result = chess.move(move);

      if(result) {
        io.emit("move", move);
        io.emit("boardState", chess.fen());
        broadcastGameState();
      }
      else {
        console.log("Invalid move : ", move);
        uniquesocket.emit("invalidMove", move);
      }
    } catch (err) {
      console.log(err);
      uniquesocket.emit("Invalid move : ", move); 
    }
  });
});
server.listen(3000, () => {
  console.log("server is running on http://localhost:3000 ");
  
});