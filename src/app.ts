import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { createServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import { db } from './db/connection';
import userRouter from './routes/users.routes';
import authRouter from './routes/auth.routes';
import gameRouter from './routes/game.routes';
import lidersRouter from './routes/liders.routes';
import messageRouter from './routes/message.routes';
import { createBot } from './bot/bot';

// Интерфейсы для игры
interface Player {
  id: string;
  username: string;
  score: number;
}

interface Card {
  id: number;
  value: string;
  flipped: boolean;
  matched: boolean;
}

interface GameRoom {
  players: Player[];
  cards: Card[];
  currentPlayer: number;
  gameStarted: boolean;
}

console.log(db);
const app = express();
const PORT = process.env.SERVER_PORT || 3000;
const server = createServer(app);

// Настройка Socket.io
const io = new SocketServer(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Игровые комнаты
const gameRooms: Record<string, GameRoom> = {};
let users:string[] = []
// const cardValues = [
//   '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼',
//   '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🐔'
// ];
const cardValues = [
  'https://testingbuild.ru/image/1.svg', 
  'https://testingbuild.ru/image/2.svg', 
  'https://testingbuild.ru/image/3.svg',
  'https://testingbuild.ru/image/4.svg', 
  'https://testingbuild.ru/image/5.svg', 
  'https://testingbuild.ru/image/6.svg', 
  'https://testingbuild.ru/image/7.svg', 
  'https://testingbuild.ru/image/8.svg', 
  'https://testingbuild.ru/image/9.svg', 
  'https://testingbuild.ru/image/10.svg', 
  'https://testingbuild.ru/image/11.svg', 
  
];

// Middlewares
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/users', userRouter);
app.use('/api/message', messageRouter);
app.use('/api/game', gameRouter);
app.use('/api/auth', authRouter);
app.use('/api/liders', lidersRouter);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date() });
});

// Функции для игры
function generateGameCards(): Card[] {
  const pairs = [...cardValues].sort(() => 0.5 - Math.random()).slice(0, 8);
  const cards = [...pairs, ...pairs]
    .map((value, index) => ({ 
      id: index, 
      value, 
      flipped: false, 
      matched: false 
    }))
    .sort(() => Math.random() - 0.5);
  return cards;
}

const gameRoomsFree =  () => {
let roomsFree:{roomId:string, name:string}[] = []
for (const [key, room] of Object.entries(gameRooms)) {
  if (room.players.length==1) {
    roomsFree.push({roomId:key, name:room.players[0].username})
  }
}
return roomsFree
}

function handleSocketConnection(socket: any) {
  console.log(`User connected: ${socket.id}`);
  users.push(socket.id)
  io.emit('updateUser', users);

  const updateListRooms = () => {
      io.emit('updateData', {rooms:gameRoomsFree()});
  }
  updateListRooms()

  socket.on('createRoom', (username: string) => {
    console.log(1223)
    const roomId = Math.random().toString(36).substring(2, 8);
    gameRooms[roomId] = {
      players: [{ id: socket.id, username, score: 0 }],
      cards: generateGameCards(),
      currentPlayer: 0,
      gameStarted: false
    };

    socket.join(roomId);
    // socket.emit('roomCreated', {rooms:Object.keys(gameRooms)});
    io.emit('roomCreated', {rooms:gameRoomsFree()});
    io.to(socket.id).emit('roomIdInCreate', {
      id: roomId     
     });
    console.log(`Game room created: ${roomId}`);
  });


  socket.on('stopFind', (idRoom: string, callback:(response: { success: boolean }) => void) => {
    console.log(idRoom)
    delete gameRooms[idRoom];
    console.log(gameRooms)
    updateListRooms()
    if (typeof callback === 'function') {
      callback({ success: true });
    }

  });  

  socket.on('joinRoom', ({ roomId, username }: { roomId: string; username: string }) => {
    const room = gameRooms[roomId];
    console.log(44)
    if (!room) {
      socket.emit('error', 'Game room not found');
      return;
    }

    if (room.players.length >= 2) {
      socket.emit('error', 'Game room is full');
      return;
    }

    room.players.push({ id: socket.id, username, score: 0 });
    socket.join(roomId);
    io.to(roomId).emit('playerJoined', {players:room.players, roomId:roomId});

    if (room.players.length === 2) {
      room.gameStarted = true;
      io.to(roomId).emit('gameStarted', {
        cards: room.cards,
        currentPlayer: room.currentPlayer
      });
      updateListRooms()
    }
  });

  socket.on('flipCard', ({ roomId, cardId }: { roomId: string; cardId: number }) => {
    console.log(roomId)
    const room = gameRooms[roomId];
    if (!room || !room.gameStarted) return;
    console.log(77)
    const playerIndex = room.players.findIndex(p => p.id === socket.id);
    if (playerIndex !== room.currentPlayer) return;

    const card = room.cards.find(c => c.id === cardId);
    if (!card || card.flipped || card.matched) return;

    card.flipped = true;
    const flippedCards = room.cards.filter(c => c.flipped && !c.matched);

    io.to(roomId).emit('cardFlipped', { cardId, playerIndex });

    if (flippedCards.length === 2) {
      if (flippedCards[0].value === flippedCards[1].value) {
        // Match found
        flippedCards.forEach(c => c.matched = true);
        room.players[playerIndex].score += 1;

        // Check if game is over
        if (room.cards.every(c => c.matched)) {
          const winner = room.players[0].score > room.players[1].score ? 0 :
                         room.players[1].score > room.players[0].score ? 1 : -1;
          io.to(roomId).emit('gameOver', { winner });
          
          // Здесь можно сохранить результаты игры в базу данных
          // await saveGameResults(roomId, room.players);
          return;
        }

        io.to(roomId).emit('matchFound', { 
          cardIds: flippedCards.map(c => c.id),
          playerIndex,
          scores: room.players.map(p => p.score)
        });
      } else {
        // No match - switch player
        setTimeout(() => {
          flippedCards.forEach(c => c.flipped = false);
          room.currentPlayer = (room.currentPlayer + 1) % 2;
          io.to(roomId).emit('switchPlayer', {
            cardIds: flippedCards.map(c => c.id),
            currentPlayer: room.currentPlayer
          });
        }, 1000);
      }
    }
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
    users = users.filter(el => el !== socket.id)    
    console.log(users)  
    io.emit('updateUser', users);
    
    for (const roomId in gameRooms) {
      const room = gameRooms[roomId];
      const playerIndex = room.players.findIndex(p => p.id === socket.id);
      console.log(playerIndex)
      if (playerIndex !== -1) {
        room.players.splice(playerIndex, 1);
        console.log(11)
        if (room.players.length === 0) {
          delete gameRooms[roomId];
          console.log(222)
          io.emit('updateData', {rooms:gameRoomsFree()});
        } else {
          delete gameRooms[roomId];
          console.log(333)
                 io.to(roomId).emit('playerLeft', room.players);
          
          if (room.gameStarted) {
            console.log(444)
            room.gameStarted = false;
                 io.to(roomId).emit('gameInterrupted');
            io.emit('updateData', {rooms:gameRoomsFree()});
       
          }
        }
      }
    }
  });
}

// Инициализация Socket.io
io.on('connection', handleSocketConnection);



export const bot = createBot();

// Start server
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log('Socket.io game server is ready');
});