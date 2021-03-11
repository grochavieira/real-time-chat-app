const users = [];

const addUser = ({ id, username, room }) => {
  // Limpar os dados
  username = username.trim().toLowerCase();
  room = room.trim().toLowerCase();

  // Validar os dados
  if (!username || !room) {
    return {
      error: "Username and room are required!",
    };
  }

  // Checa por um usuário existente
  const existingUser = users.find((user) => {
    return user.room === room && user.username === username;
  });

  // Validar username
  if (existingUser) {
    return {
      error: "Username is in use!",
    };
  }

  // Armazenar user
  const user = { id, username, room };
  users.push(user);
  return { user };
};

const removeUser = (id) => {
  const index = users.findIndex((user) => user.id === id);

  if (index !== -1) {
    return users.splice(index, 1)[0];
  }
};

const getUser = (id) => {
  return users.find((user) => user.id === id);
};

const getUsersInRoom = (room) => {
  room = room.trim().toLowerCase();
  return users.filter((user) => user.room === room);
};

module.exports = {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom,
};
