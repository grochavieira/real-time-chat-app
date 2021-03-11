const path = require("path");
const express = require("express");
const http = require("http");
const socketio = require("socket.io");
const Filter = require("bad-words");
const {
  generateMessage,
  generateLocationMessage,
} = require("./utils/messages");
const {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom,
} = require("./utils/users");
const app = express();
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT || 3333;

const publicDirectoryPath = path.join(__dirname, "../public");

// Renderiza o conteúdo da pasta public
app.use(express.static(publicDirectoryPath));

// mensagem padrão de conexão de um novo usuário
// no socket.io
io.on("connection", (socket) => {
  // console.log("New WebSocket connection");

  // é ativado quando um novo usuário tenta se juntar a uma nova sala
  socket.on("join", (options, callback) => {
    const { error, user } = addUser({ id: socket.id, ...options });

    if (error) {
      return callback(error);
    }

    // É usado para se juntar a uma nova sala e poder enviar msg
    // especificamente para essa sala
    socket.join(user.room);

    // emite uma mensagem de bem vindo somente para o usuário que se juntou a sala
    socket.emit("message", generateMessage("admin", "Bem vindo!"));

    // emite uma mensagem a todos os usuários da sala, menos quem acabou de se juntar
    socket.broadcast
      .to(user.room)
      .emit(
        "message",
        generateMessage("admin", `${user.username} se juntou a sala de chat!`)
      );

    // emite uma mensagem para todos os usuários da sala
    io.to(user.room).emit("roomData", {
      room: user.room,
      users: getUsersInRoom(user.room),
    });

    callback();
  });

  // utilizado para enviar mensagem de um usuário para todos na sala
  socket.on("sendMessage", (message, callback) => {
    const user = getUser(socket.id);

    // É usado para filtrar palavras consideradas de
    // baixo calão
    // const filter = new Filter();
    // if (filter.isProfane(message)) {
    //   return callback("Profanity is not allowed");
    // }

    io.to(user.room).emit("message", generateMessage(user.username, message));
    callback("");
  });

  // Usado para enviar a localização do usuário para todos na sala
  socket.on("sendLocation", (coords, callback) => {
    const user = getUser(socket.id);

    io.to(user.room).emit(
      "locationMessage",
      generateLocationMessage(
        user.username,
        `https://google.com/maps?q=${coords.latitude},${coords.longitude}`
      )
    );
    callback();
  });

  // Usado quando um usuário fecha a aba ou sai da sala
  socket.on("disconnect", () => {
    const user = removeUser(socket.id);

    if (user) {
      io.to(user.room).emit(
        "message",
        generateMessage("admin", `${user.username} saiu da sala!`)
      );
      io.to(user.room).emit("roomData", {
        room: user.room,

        users: getUsersInRoom(user.room),
      });
    }
  });
});

server.listen(port, () => {
  console.log(`Servidor está rodando na porta ${port}...`);
});
