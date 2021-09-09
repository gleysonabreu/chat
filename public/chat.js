const socket = io();


const urlSearch = new URLSearchParams(window.location.search);
const username = urlSearch.get('name');
const room = urlSearch.get('room');

const userDiv = document.getElementById('user');
userDiv.innerHTML = `
<span>Username: ${username} - Sala: <strong>${room}</strong></span>
<span><a href="/">QUIT</a></span>
`;

socket.emit('room', {
  username,
  room
}, messages => {
  
  messages.forEach(message => {
    createMessage(message);
  });

});

document.getElementById('message').addEventListener("keypress", (event) => {
  if(event.key === "Enter") {
    const message = event.target.value;
    const data = {
      room,
      message,
      username
    }

    socket.emit("message", data);

    event.target.value = '';
  }
});

socket.on("message", (data) => {
  createMessage(data);
});

socket.on('online', (data) => {
  const { usersRoom, lastUser } = data;
  
  usersConnected(usersRoom);
  if(lastUser) {
    createMessageInfoRoom(lastUser, 'connect')
  }
});

socket.on('disconnectUser', (data) => {
  createMessageInfoRoom(data);
});


function createMessage(data){
  const messagesDiv = document.getElementById('messages');
  const createMessage = document.createElement('div');
  createMessage.id = 'message';
  createMessage.className = `${data.username === username && 'align-items'}`;

  const createDivName = document.createElement('div');
  createDivName.className = 'name';

  const createDateMessage = document.createElement('span');
  createDateMessage.innerHTML = dayjs(data.createdAt).format('MMM D, YYYY h:mm A');

  const createNameMessage = document.createElement('h1');
  createNameMessage.innerHTML = data.username;

  createDivName.appendChild(createNameMessage);
  createDivName.appendChild(createDateMessage);

  const createBodyMessage = document.createElement('div');
  createBodyMessage.className = `body ${data.username === username ? 'me' : 'guest'}`;
  const createMessageBody = document.createElement('p');
  createMessageBody.innerHTML = data.message;
  createBodyMessage.appendChild(createMessageBody);

  createMessage.appendChild(createDivName);
  createMessage.appendChild(createBodyMessage);

  messagesDiv.appendChild(createMessage);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

function createMessageInfoRoom(data, type = 'disconnect') {
  const messagesDiv = document.getElementById('messages');

  const createDisconnectDiv = document.createElement('div');
  createDisconnectDiv.className = 'disconnectUser';
  const createDivOff = document.createElement('div');
  createDivOff.className = 'off';
  const createTextDisconnect = document.createElement('h1');
  createTextDisconnect.innerHTML = `${data.username} ${type === 'disconnect' ? 'disconnect' : 'connected'}!`;

  createDivOff.appendChild(createTextDisconnect)
  createDisconnectDiv.appendChild(createDivOff);
  messagesDiv.appendChild(createDisconnectDiv);

  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

function usersConnected(data) {
  const usersConnected = document.getElementById('users-connected');
  const usersOnlineText = document.getElementById('users-online-text');
  usersOnlineText.innerHTML = `Users online (${data.length})`;
  usersConnected.innerHTML = '';


  data.forEach(user => {
    const liUserConnected = document.createElement('li');
    liUserConnected.innerText = user.username;

    usersConnected.appendChild(liUserConnected)
  });
}