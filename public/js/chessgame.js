const socket = io();
const chess = new Chess();
const boardElement = document.querySelector(".chessboard");

let draggedPiece = null;
let sourceSquare = null;

// Render the chessboard and pieces
const renderBoard = () => {
    const board = chess.board();
    boardElement.innerHTML = ""; // Clear the board

    board.forEach((row, rowIndex) => {
        row.forEach((square, colIndex) => {
            const squareElement = document.createElement("div");
            squareElement.classList.add("square", (rowIndex + colIndex) % 2 === 0 ? "light" : "dark");
            squareElement.dataset.row = rowIndex;
            squareElement.dataset.col = colIndex;

            // Add piece if it exists
            if (square) {
                const pieceElement = document.createElement("div");
                pieceElement.classList.add("piece");
                pieceElement.innerText = getPieceUnicode(square);
                pieceElement.draggable = true;

                pieceElement.addEventListener("dragstart", (e) => {
                    draggedPiece = pieceElement;
                    sourceSquare = { row: rowIndex, col: colIndex };
                    e.dataTransfer.setData("text/plain", "");
                });

                pieceElement.addEventListener("dragend", () => {
                    draggedPiece = null;
                    sourceSquare = null;
                });

                squareElement.appendChild(pieceElement);
            }

            // Add drop functionality
            squareElement.addEventListener("dragover", (e) => e.preventDefault());

            squareElement.addEventListener("drop", () => {
                const targetSquare = {
                    row: parseInt(squareElement.dataset.row),
                    col: parseInt(squareElement.dataset.col),
                };
                handleMove(sourceSquare, targetSquare);
            });

            boardElement.appendChild(squareElement);
        });
    });
};

// Get Unicode character for a chess piece
const getPieceUnicode = (piece) => {
    const pieces = {
        p: "♟", r: "♜", n: "♞", b: "♝", q: "♛", k: "♚",
        P: "♙", R: "♖", N: "♘", B: "♗", Q: "♕", K: "♔",
    };
    return pieces[piece.color === "w" ? piece.type.toUpperCase() : piece.type];
};

// Handle move logic
const handleMove = (source, target) => {
    const move = {
        from: `${String.fromCharCode(97 + source.col)}${8 - source.row}`,
        to: `${String.fromCharCode(97 + target.col)}${8 - target.row}`,
    };

    if (chess.move(move)) {
        socket.emit("move", move);
        renderBoard();
    } else {
        console.log("Invalid move", move);
    }
};

// Handle updates from the server
socket.on("move", (move) => {
    chess.move(move);
    renderBoard();
});

// Assign player roles and render the board
socket.on("playerRole", (role) => {
    console.log("You are player:", role === "w" ? "White" : "Black");
    renderBoard();
});

renderBoard();
