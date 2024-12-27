const express = require("express");
const socket = require("socket.io");
const http = require("http");
const path = require("path");
const { Chess } = require("chess.js");

const app = express();
const server = http.createServer(app);
const io = socket(server);

const chess = new Chess();
let players = {};

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
    res.render("index", { title: "Chess Game" });
});

io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    // Assign player roles
    if (!players.white) {
        players.white = socket.id;
        socket.emit("playerRole", "w");
    } else if (!players.black) {
        players.black = socket.id;
        socket.emit("playerRole", "b");
    } else {
        socket.emit("spectatorRole");
    }

    socket.on("move", (move) => {
        if (chess.turn() === "w" && socket.id !== players.white) return;
        if (chess.turn() === "b" && socket.id !== players.black) return;

        if (chess.move(move)) {
            io.emit("move", move);
        }
    });

    socket.on("disconnect", () => {
        if (socket.id === players.white) delete players.white;
        if (socket.id === players.black) delete players.black;
    });
});

server.listen(3000, () => {
    console.log("Server is running on http://localhost:3000");
});
