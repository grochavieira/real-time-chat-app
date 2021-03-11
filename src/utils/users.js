const users = [];

const addUser = ({ id, username, room }) => {
  // Limpa os dados
  username = username.trim().toLowerCase();
  room = room.trim().toLowerCase();

  // Valida os dados
  if (!username || !room) {
    return {
      error: "Username and room are required!",
    };
  }

  // Checa por um usuário existente
  const existingUser = users.find((user) => {
    return user.room === room && user.username === username;
  });

  // Validaa o username
  if (existingUser) {
    return {
      error: "Username is in use!",
    };
  }

  // Armazena o user
  const user = { id, username, room };
  users.push(user);
  return { user };
};

// Remove um usuário
const removeUser = (id) => {
  const index = users.findIndex((user) => user.id === id);

  if (index !== -1) {
    return users.splice(index, 1)[0];
  }
};

// Busca por um usuário e retorna ele caso exista
const getUser = (id) => {
  return users.find((user) => user.id === id);
};

// Retorna todos os usuários de uma sala
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
