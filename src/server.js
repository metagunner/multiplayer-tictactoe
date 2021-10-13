/* eslint-disable no-console */
import express from 'express';
import http from 'http';
import path from 'path';
import { Server } from 'socket.io';
import { matchStatus, searchGame, getGameLobby, leaveGameLobby } from './lobby';

const PORT = process.env.PORT || 3000;
const app = express();
const httpServer = http.createServer(app);
const io = new Server(httpServer);

app.use(express.static(path.join(__dirname, './public')));

function onDisconnet(socketId) {
  console.log('disconnected');
  const gameLobby = getGameLobby(socketId);
  if (gameLobby) {
    if (gameLobby.matchStatus !== matchStatus.Finish) {
      // Let the player know that his opponent is left the game
      const opponent = gameLobby.getOpponent(socketId);
      opponent.socket.emit('game-over', {
        winner: 'OPPONENT LEFT',
      });
      gameLobby.updateMatchStatus(matchStatus.Finish);
    }
    leaveGameLobby(socketId);
  }
}

function onMakeMove(socket, position) {
  const socketId = socket.id;
  const gameLobby = getGameLobby(socketId);

  if (!gameLobby || gameLobby.matchStatus === matchStatus.Finish) {
    socket.emit('message', {
      message: 'Search for a game first',
      messageType: 'error-message',
    });
    return;
  }

  const gameBoard = gameLobby.getGameBoard();

  // player made the move
  const currentPlayer = gameLobby.getPlayer(socketId);

  // wait for your turn
  if (currentPlayer.mark !== gameBoard.getCurrentPlayerMark()) {
    currentPlayer.socket.emit('message', {
      message: 'Wait for your turn!',
      messageType: 'error-message',
    });
    return;
  }

  try {
    const isGameOver = gameBoard.makeMove(position);

    gameLobby.emitToPlayers((player) => {
      player.socket.emit('move-made', {
        gameBoard: gameBoard.getBoardJSON(),
        currentPlayer: gameBoard.getCurrentPlayerMark(),
      });
    });

    if (isGameOver) {
      const winner = gameBoard.getWinner();
      gameLobby.updateMatchStatus(matchStatus.Finish);
      gameLobby.emitToPlayers((player) => {
        player.socket.emit('game-over', {
          winner,
          youWon: player.mark === winner,
        });
      });
    }
  } catch (error) {
    // TODO: acknowledge with a callback
    socket.emit('message', {
      message: error.message,
      messageType: 'error-message',
    });
  }
}

function onRestart(socketId) {
  const gameLobby = getGameLobby(socketId);
  if (gameLobby && gameLobby.matchStatus === matchStatus.Finish) {
    leaveGameLobby(socketId);
  }
}

io.on('connection', (socket) => {
  console.log('a user connected ', socket.id);

  socket.on('searching', () => {
    if (!getGameLobby(socket.id)) searchGame(socket);

    // If the game is created, then the opponent is found and the player is in the game
    const gameLobby = getGameLobby(socket.id);

    if (gameLobby && gameLobby.matchStatus === matchStatus.Started) {
      gameLobby.updateMatchStatus(matchStatus.InMatch);
      gameLobby.emitToPlayers((player) => {
        player.socket.emit('game-started', { mark: player.mark });
      });
    }
  });
  socket.on('make-move', (position) => onMakeMove(socket, position));
  socket.on('restart', () => onRestart(socket.id));
  socket.on('disconnect', () => onDisconnet(socket.id));
});

httpServer.listen(PORT, () => console.log(`Server is started on PORT ${PORT}`));
