import { io } from './app';

type DataRoom = {
  username: string;
  room: string;
}

type UserRoom = {
  username: string;
  socketId: string;
  room: string;
}

type UserMessage = {
  room: string;
  message: string;
  username: string;
}

type MessageProps = {
  room: string;
  message: string;
  createdAt: Date;
  username: string;
}

const users: UserRoom[] = [];
const messages: MessageProps[] = [];

io.on('connection', (socket) => {

  socket.on('disconnect', () => {
    const disconnectUser = users.find(user => user.socketId === socket.id);

    if(disconnectUser) {
      users.splice(users.indexOf(disconnectUser), 1);

      const usersRoom = users.filter(user => user.room === disconnectUser.room);
      io.to(disconnectUser.room).emit('online', { usersRoom });
      io.to(disconnectUser.room).emit('disconnectUser', disconnectUser);
    }
  });
  
  socket.on('room', (data: DataRoom, callback) => {
    const user = {
      ...data,
        socketId: socket.id,
    }
    socket.join(data.room);

    const userInRoom = users.find(user => user.username === data.username && user.room === data.room);
    if (userInRoom) {
      userInRoom.socketId = socket.id;
    } else {
      users.push(user);
    }

    const usersRoom = users.filter(user => user.room === data.room);
    const messages = getMessages(data.room);

    callback(messages);
    io.to(data.room).emit('online', {
      usersRoom,
      lastUser: user,
    });
    
  });

  socket.on('message', (data: UserMessage) => {
    const message = {
      ...data,
      createdAt: new Date(),
    }
    messages.push(message);

    io.to(data.room).emit('message', message);
  });

});

function getMessages(room: string): MessageProps[] {
  return messages.filter(message => message.room === room);
};