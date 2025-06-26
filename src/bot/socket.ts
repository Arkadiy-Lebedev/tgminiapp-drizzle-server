
import { Server, Socket } from 'socket.io';
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

// Настройка Socket.io
const io = new SocketServer(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Игровые комнаты
const gameRooms: Record<string, GameRoom> = {};
const cardValues = [
  '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼',
  '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🐔'
];
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
function handleSocketConnection(socket: any) {
  console.log(`User connected: ${socket.id}`);

  socket.on('createGameRoom', (username: string) => {
    const roomId = Math.random().toString(36).substring(2, 8);
    gameRooms[roomId] = {
      players: [{ id: socket.id, username, score: 0 }],
      cards: generateGameCards(),
      currentPlayer: 0,
      gameStarted: false
    };
    socket.join(roomId);
    socket.emit('gameRoomCreated', roomId);
    console.log(`Game room created: ${roomId}`);
  });

  socket.on('joinGameRoom', ({ roomId, username }: { roomId: string; username: string }) => {
    const room = gameRooms[roomId];
    
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
    io.to(roomId).emit('playerJoined', room.players);

    if (room.players.length === 2) {
      room.gameStarted = true;
      io.to(roomId).emit('gameStarted', {
        cards: room.cards,
        currentPlayer: room.currentPlayer
      });
    }
  });

  socket.on('flipCard', ({ roomId, cardId }: { roomId: string; cardId: number }) => {
    const room = gameRooms[roomId];
    if (!room || !room.gameStarted) return;

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
    for (const roomId in gameRooms) {
      const room = gameRooms[roomId];
      const playerIndex = room.players.findIndex(p => p.id === socket.id);
      
      if (playerIndex !== -1) {
        room.players.splice(playerIndex, 1);
        
        if (room.players.length === 0) {
          delete gameRooms[roomId];
        } else {
          io.to(roomId).emit('playerLeft', room.players);
          
          if (room.gameStarted) {
            room.gameStarted = false;
            io.to(roomId).emit('gameInterrupted');
          }
        }
      }
    }
  });
}
return io.on('connection', handleSocketConnection);