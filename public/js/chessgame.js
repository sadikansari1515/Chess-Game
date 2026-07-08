const socket = io();
const chess = new Chess();
const boardElement = document.querySelector(".chessboard");
const turnIndicator = document.getElementById("turn-indicator");
const gameStatus = document.getElementById("game-status");

let draggedPiece = null;
let sourceSquare = null;
let playerRole = null;
let currentTurn = "w";
let gameOver = false;

const renderBoard = () => {
  const board = chess.board();
  boardElement.innerHTML = "";
  board.forEach((row, rowindex) => {
    row.forEach((square, squareindex) => {
      const squareElement = document.createElement("div");
      squareElement.classList.add(
        "square",
        (rowindex + squareindex) % 2 === 0 ? "light" : "dark"
      );

      squareElement.dataset.row = rowindex;
      squareElement.dataset.col = squareindex;

      if(square) {
        const pieceElement = document.createElement("div");
        pieceElement.classList.add(
          "piece",
          square.color === "w" ? "white" : "black"
        );
        pieceElement.innerText = getPieceUnicode(square);
        pieceElement.draggable = playerRole === square.color && !gameOver && currentTurn === playerRole;

        pieceElement.addEventListener("dragstart", (e) => {
          if(pieceElement.draggable) {
            draggedPiece = pieceElement;
            sourceSquare = { row: rowindex, col: squareindex };
            e.dataTransfer.setData("text/plain", "");
          }
        });

        pieceElement.addEventListener("dragend", (e) => {
          draggedPiece = null;
          sourceSquare = null;
        });

        squareElement.appendChild(pieceElement);
      }

      squareElement.addEventListener("dragover", (e) => {
        e.preventDefault();
      });

      squareElement.addEventListener("drop", (e) => {
        e.preventDefault();
        if(draggedPiece) {
          const targetSource = {
            row: parseInt(squareElement.dataset.row),
            col: parseInt(squareElement.dataset.col)
          };

          handleMove(sourceSquare, targetSource);
        }
      });
      boardElement.appendChild(squareElement);
    })
  });

  if(playerRole === "b") {
    boardElement.classList.add("flipped")
  }
  else {
    boardElement.classList.remove("flipped")
  }

  updateTurnDisplay();
};

const isPromotionMove = (source, target) => {
  const sourceSquare = `${String.fromCharCode(97 + source.col)}${8 - source.row}`;
  const piece = chess.get(sourceSquare);

  if (!piece || piece.type !== "p") {
    return false;
  }

  return (piece.color === "w" && target.row === 0) || (piece.color === "b" && target.row === 7);
};

const showPromotionPicker = (move) => {
  const overlay = document.createElement("div");
  overlay.className = "fixed inset-0 z-50 flex items-center justify-center bg-black/70";
  overlay.innerHTML = `
    <div class="rounded-lg bg-white p-4 text-center shadow-xl">
      <p class="mb-3 font-semibold text-zinc-800">Choose promotion piece</p>
      <div class="flex gap-2">
        <button class="promotion-btn rounded bg-zinc-800 px-3 py-2 text-white" data-piece="q">Queen</button>
        <button class="promotion-btn rounded bg-zinc-800 px-3 py-2 text-white" data-piece="r">Rook</button>
        <button class="promotion-btn rounded bg-zinc-800 px-3 py-2 text-white" data-piece="b">Bishop</button>
        <button class="promotion-btn rounded bg-zinc-800 px-3 py-2 text-white" data-piece="n">Knight</button>
      </div>
    </div>
  `;

  overlay.querySelectorAll(".promotion-btn").forEach((button) => {
    button.addEventListener("click", () => {
      socket.emit("move", { ...move, promotion: button.dataset.piece });
      overlay.remove();
    });
  });

  document.body.appendChild(overlay);
};

const updateTurnDisplay = () => {
  if (turnIndicator) {
    if (gameOver) {
      turnIndicator.textContent = "Game over";
    } else {
      turnIndicator.textContent = currentTurn === "w" ? "White to move" : "Black to move";
    }
  }
};

const handleMove = (source, target) => {
  if (gameOver) return;

  const move = {
    from: `${String.fromCharCode(97 + source.col)}${8 - source.row}`,
    to: `${String.fromCharCode(97 + target.col)}${8 - target.row}`,
  };

  if (isPromotionMove(source, target)) {
    showPromotionPicker(move);
  } else {
    socket.emit("move", move);
  }
};

const getPieceUnicode = (piece) => {
  const unicodePieces = {
    p: "♟",
    r: "♜",
    n: "♞",
    b: "♝",
    q: "♛",
    k: "♚",
    P: "♙",
    R: "♖",
    N: "♘",
    B: "♗",
    Q: "♕",
    K: "♔",
  };

  const key = piece.color === "w" ? piece.type.toUpperCase() : piece.type.toLowerCase();
  return unicodePieces[key] || "";
};

socket.on("playerRole", (role) => {
  playerRole = role;
  renderBoard();
});

socket.on("turn", (turn) => {
  currentTurn = turn;
  updateTurnDisplay();
  renderBoard();
});

socket.on("boardState", (fen) => {
  chess.load(fen);
  renderBoard();
});

socket.on("move", (move) => {
  chess.move(move);
  renderBoard();
});

socket.on("gameOver", (result) => {
  gameOver = result.over;
  if (gameStatus) {
    if (result.winner === "Draw") {
      gameStatus.textContent = `Game over — ${result.reason}.`;
    } else {
      gameStatus.textContent = `Game over — ${result.winner} wins by ${result.reason}.`;
    }
  }
  updateTurnDisplay();
});

updateTurnDisplay();
renderBoard();