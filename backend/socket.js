const express = require("express");
const socketIO = require("socket.io");
const http = require("http");
require("dotenv").config();
// assign port
const socketPort = process.env.SOCKET_PORT || 4000;
// set app configurations
let app = express();
app.use(require("cors"));
let server = http.createServer(app);
let io = socketIO(server, {
  cors: {
    origin: `*`,
    methods: ["HEAD", "GET", "POST"],
  },
});
// store client connections
// id: id of requestingClient
// value: id for client to send data to, connection data
const clients = {};
const socketID = {};
// set socket functions and server
async function serve() {
  // if all data is accessible the initialize socket server
  await io.on("connection", (socket) => {
    console.log(
      `New connection from : ${socket.id} ( ${socket.request.connection.remoteAddress} )`,
    );
    socket.on("handshake", async (data) => {
      socketID[socket.id] = data.token;
      const id = await getID(data.email);
      clients[data.token] = [id, socket];
      const isOnline =
        Object.keys(clients).find((item) => {
          return item === id;
        }) !== undefined;
      if (isOnline) {
        clients[clients[data.token][0]][1].emit("updateOnline", {
          online: true,
        });
      }
      socket.emit("handshakeResponse", {
        success: true,
        online: isOnline,
      });
    });
    socket.on("updateGame", async (gameData) => {
      const oldGameData = await fetchGame(gameData._id);
      if (
        gameData === undefined ||
        gameData == null ||
        oldGameData.timestamp !== gameData.timestamp ||
        oldGameData === undefined ||
        oldGameData == null ||
        JSON.stringify(oldGameData.users) !== JSON.stringify(gameData.users) ||
        JSON.stringify(oldGameData.usersinfo) !== JSON.stringify(gameData.usersinfo) ||
        JSON.stringify(oldGameData.moves) !== JSON.stringify(gameData.moves) ||
        oldGameData.finished !== gameData.finished
      ) {
        socket.emit("updateGameResponse", {
          success: false,
          message: "invalid request.",
        });
        return false;
      }
      const valid = await isGameValid(oldGameData, gameData);
      if (valid) {
        gameData.finished = await evaluateFinish(gameData.state);
        gameData.moves =
          gameData.moves === gameData.users[0] ? gameData.users[1] : gameData.users[0];
        gameData.timestamp = Date.now();
        await updateGame(gameData);
        gameData._id = oldGameData._id;
        socket.emit("updateGameResponse", {
          success: true,
          data: gameData,
        });
        const player2ID = await getID(gameData.moves);
        const isOnline =
          Object.keys(clients).find((item) => {
            return item === player2ID;
          }) !== undefined;
        if (isOnline) {
          clients[player2ID][1].emit("updateGameResponse", {
            success: true,
            data: gameData,
          });
        }
        return true;
      }

      socket.emit("updateGameResponse", {
        success: false,
        message: "inconsistent data.",
        data: oldGameData,
      });
      return false;
    });
    socket.on("restartGame", async (game) => {
      const isValid =
        Object.keys(clients).find((item) => {
          return item === game.token;
        }) !== undefined;
      if (isValid) {
        const _id = game.game._id;
        game.game.timestamp = Date.now();
        game.game.moves =
          Math.round(Math.random() * 100 + 1) % 2 ? game.game.users[1] : game.game.users[0];
        game.game.state = ["", "", "", "", "", "", "", "", ""];
        game.game.finished = "";
        updateGame(game.game);
        game.game._id = _id;
        socket.emit("updateGameResponse", {
          success: true,
          data: game.game,
        });
        const isOnline =
          Object.keys(clients).find((item) => {
            return item === clients[game.token][0];
          }) !== undefined;
        if (isOnline) {
          clients[clients[game.token][0]][1].emit("updateGameResponse", {
            success: true,
            data: game.game,
          });
        }
        return true;
      }
      socket.emit("updateGameResponse", {
        success: false,
        message: "invalid request",
      });
      return false;
    });
    socket.on("disconnect", async () => {
      if (
        socketID[socket.id] != null &&
        socketID[socket.id] !== undefined &&
        clients[socketID[socket.id]] != null &&
        clients[socketID[socket.id]] !== undefined
      ) {
        const id = Object.keys(clients).find((item) => {
          return item === clients[socketID[socket.id]][0];
        });
        if (id !== undefined) {
          clients[id][1].emit("updateOnline", {
            online: false,
          });
        }
      }
      delete clients[socketID[socket.id]];
      delete socketID[socket.id];
      console.log(
        `user disconnected : ${socket.id} ( ${socket.request.connection.remoteAddress} )`,
      );
    });
  });
  // start socket server
  console.log(`Socket Server running at PORT ${socketPort}`);
  server.listen(socketPort);
}

serve();
// game functions
function isGameValid(oldGameData, newGameData) {
  var previousCount = {},
    newCount = {};
  previousCount[oldGameData.users[0]] = 0;
  previousCount[oldGameData.users[1]] = 0;
  newCount[oldGameData.users[0]] = 0;
  newCount[oldGameData.users[1]] = 0;
  var i = 0;
  const newGame = newGameData.state;
  const oldGame = oldGameData.state;
  for (; i < oldGame.length; i++) {
    if (oldGame[i] !== "" && oldGame[i] !== newGame[i]) {
      return false;
    }
    if (newGame[i] !== "") {
      newCount[newGame[i]]++;
    }
    if (oldGame[i] !== "") {
      previousCount[oldGame[i]]++;
    }
  }
  var newKeys = Object.keys(previousCount),
    oldKeys = Object.keys(newCount);
  if (newKeys.length !== oldKeys.length) {
    return false;
  }
  i = 0;
  var count = 0;
  for (; i < oldKeys.length; i++) {
    count += Math.abs(previousCount[oldKeys[i]] - newCount[oldKeys[i]]);
  }
  const otherUser =
    oldGameData.moves === oldGameData.users[0] ? oldGameData.users[1] : oldGameData.users[0];
  return (
    count === 1 &&
    previousCount[otherUser] === newCount[otherUser] &&
    previousCount[oldGameData.moves] !== newCount[oldGameData.moves]
  );
}
function evaluateFinish(gameState) {
  var i = 0;
  var flag = true;
  for (; i < 3; i++) {
    flag = true;
    for (var j = 0; j < 2; j++) {
      if (gameState[i * 3 + j] !== gameState[i * 3 + j + 1]) {
        flag = false;
        break;
      }
    }
    if (flag) {
      return gameState[3 * i];
    }
  }
  i = 0;
  for (; i < 3; i++) {
    flag = true;
    for (var j = 0; j < 2; j++) {
      if (gameState[j * 3 + i] !== gameState[(j + 1) * 3 + i]) {
        flag = false;
        break;
      }
    }
    if (flag) {
      return gameState[i];
    }
  }
  if (gameState[0] === gameState[4] && gameState[4] === gameState[8]) {
    return gameState[4];
  }
  if (gameState[2] === gameState[4] && gameState[4] === gameState[6]) {
    return gameState[4];
  }
  i = 0;
  for (; i < 9; i++) {
    if (gameState[i] === "") {
      return "";
    }
  }
  return "draw";
}

// mongoDb function to fetch userID and update data
async function getID(emailID) {
  const URI = `mongodb+srv://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@notepad.ugmhfkn.mongodb.net/?retryWrites=true&w=majority`;
  const Mongodb = require("mongodb");
  const client = new Mongodb.MongoClient(URI);
  await client.connect();
  const db = await client.db("tictactoe");
  const result = await db.collection("user").findOne({
    email: emailID,
  });
  client.close();
  if (result === null) {
    return null;
  }
  return result._id.toString();
}

async function fetchGame(gameID) {
  const URI = `mongodb+srv://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@notepad.ugmhfkn.mongodb.net/?retryWrites=true&w=majority`;
  const Mongodb = require("mongodb");
  const client = new Mongodb.MongoClient(URI);
  await client.connect();
  const db = await client.db("tictactoe");
  const result = await db.collection("games").findOne({
    _id: Mongodb.ObjectId(gameID),
  });
  client.close();
  if (result == null || result === undefined) {
    return null;
  }
  result._id = result._id.toString();
  return result;
}

async function updateGame(gameData) {
  const URI = `mongodb+srv://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@notepad.ugmhfkn.mongodb.net/?retryWrites=true&w=majority`;
  const Mongodb = require("mongodb");
  const client = new Mongodb.MongoClient(URI);
  await client.connect();
  const db = await client.db("tictactoe");
  const gameID = gameData._id;
  delete gameData._id;
  await db.collection("games").updateOne(
    {
      _id: Mongodb.ObjectId(gameID),
    },
    {
      $set: gameData,
    },
  );
  client.close();
  return true;
}
