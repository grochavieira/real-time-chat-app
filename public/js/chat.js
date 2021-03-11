// inicializa o socket no lado do cliente
const socket = io();

// elementos
const $messageForm = document.querySelector("#message-form");
const $messageFormInput = $messageForm.querySelector("input");
const $messageFormButton = $messageForm.querySelector("button");
const $sendLocationButton = document.querySelector("#send-location");
const $messages = document.querySelector("#messages");

// templates utilizados pelo mustache.js
const messageTemplate = document.querySelector("#message-template").innerHTML;
const locationMessageTemplate = document.querySelector(
  "#location-message-template"
).innerHTML;
const sidebarTemplate = document.querySelector("#sidebar-template").innerHTML;

// pega os dados do usuário no link http
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

// Função utilizada para fazer o auto-rolamento das mensagens
const autoscroll = () => {
  // Novo elemento que contém a mensagem enviada
  const $newMessage = $messages.lastElementChild;

  // Pega a altura da última mensagem
  const newMessageStyles = getComputedStyle($newMessage);
  const newMessageMargin = parseInt(newMessageStyles.marginBottom);

  // Adiciona a altura
  const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;

  // Altura visível da tela de mensagens
  const visibleHeight = $messages.offsetHeight;

  // Altura do container das mensagens
  const containerHeight = $messages.scrollHeight;

  // Pega até onde foi usado o rolamento
  const scrollOffset = $messages.scrollTop + visibleHeight;

  // Caso a barra de rolamento esteja bem próxima da última mensagem
  // enviada, é realizado o rolamento automático
  if (containerHeight - newMessageHeight <= scrollOffset) {
    $messages.scrollTop = $messages.scrollHeight;
  }
};

// socket que recebe as mensagens dos outros usuários
socket.on("message", (message) => {
  const html = Mustache.render(messageTemplate, {
    username: message.username,
    message: message.text,
    createdAt: moment(message.createdAt).format("h:mm a"),
  });
  $messages.insertAdjacentHTML("beforeend", html);
  autoscroll();
});

// socket que recebe os dados da sala
socket.on("roomData", ({ room, users }) => {
  const html = Mustache.render(sidebarTemplate, {
    room,
    users,
  });
  document.querySelector("#sidebar").innerHTML = html;
  autoscroll();
});

// socket que recebe os dados de localização
socket.on("locationMessage", (message) => {
  const html = Mustache.render(locationMessageTemplate, {
    username: message.username,
    url: message.url,
    createdAt: moment(message.createdAt).format("h:mm a"),
  });
  $messages.insertAdjacentHTML("beforeend", html);
});

// evento do formulário para enviar as mensagens
$messageForm.addEventListener("submit", (e) => {
  e.preventDefault();

  $messageFormButton.setAttribute("disabled", "disabled");

  const message = e.target.elements.message.value;
  socket.emit("sendMessage", message, (error) => {
    $messageFormButton.removeAttribute("disabled");
    $messageFormInput.value = "";
    $messageFormInput.focus();

    if (error) {
      return console.log(error);
    }
  });
});

// evento do botão utilizado para enviar a localização do usuário
$sendLocationButton.addEventListener("click", () => {
  if (!navigator.geolocation) {
    return alert("Geolocalização não é suportada no seu browser!");
  }

  $sendLocationButton.setAttribute("disabled", "disabled");

  navigator.geolocation.getCurrentPosition((position) => {
    socket.emit(
      "sendLocation",
      {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      },
      () => {
        $sendLocationButton.removeAttribute("disabled");
      }
    );
  });
});

// socket responsável por emitir os dados do usuário
// para ele se juntar em uma sala
socket.emit("join", { username, room }, (error) => {
  if (error) {
    alert(error);
    location.href = "/";
  }
});
