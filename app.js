const express = require("express");
const socket = require("socket.io");
const http = require("http");
const {Chess} = require("chess.js");
const path = require("path");
const { title } = require("process");

const app = express();

const server = http.createServer(app);
const io = socket(server);

const chess = new Chess();

let players = {};
let currentPlayer = "W";

app.set("view engine","ejs");
app.use(express.static(path.join(__dirname,"public")));

app.get("/",(req,res)=>{
    res.render("index",{title:"Chess Game"});
});

io.on("connection",function (uniquesocket) {
    console.log("connected");

    if (!players.white) {
        players.white = uniquesocket.id;
        uniquesocket.emit("playerRole","w");
    }
    else if (!players.black) {
        players.black = uniquesocket.id;
        uniquesocket.emit("playerRole","b");
    }
    else {
        uniquesocket.emit("spectatorRole");
    }

    uniquesocket.on("disconnect",function () {

        if (uniquesocket.id === players.white) {
            delete players.white;
        }
        else if (uniquesocket.id === players.black) {
            delete players.black;
        }
    });

    uniquesocket.on("move",(move)=>{
        try {
            if (chess.turn() === "w" && uniquesocket.id !== players.white) return;
            if (chess.turn() === "b" && uniquesocket.id !== players.black) return;

            const result = chess.move(move);
            if (result) {
                currentPlayer = chess.turn();
                io.emit("move",move)
                io.emit("boardState",chess.fen());
            }
            else {
                console.log("Invalid Move",move);
                uniquesocket.emit("Invalid Move",move);
            }
        } catch(err) {
            console.log(err);
            uniquesocket.emit("Invalid Move:",move);
        }
    });
});

server.listen(3000,function() {
    console.log("Listening On Port 3000");
});